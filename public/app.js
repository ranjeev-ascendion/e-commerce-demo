// ApexCart Frontend Application JavaScript
const API_BASE = '/api/v1';

class ApexCartApp {
  constructor() {
    this.products = [];
    this.cart = { items: [], total_price: 0, item_count: 0 };
    this.currentUser = null;
    this.authToken = localStorage.getItem('apexcart_token') || null;
    this.currentCategory = '';
    this.searchQuery = '';
    this.authMode = 'login';
    this.editingProductId = null;

    this.init();
  }

  async init() {
    await this.checkAuthStatus();
    await this.fetchProducts();
    await this.fetchCart();
    this.setupEventListeners();
  }

  // --- Auth Methods ---
  async checkAuthStatus() {
    if (!this.authToken) {
      this.updateUserUI(null);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      const data = await res.json();
      if (data.user) {
        this.currentUser = data.user;
        this.updateUserUI(data.user);
      } else {
        this.logout();
      }
    } catch (e) {
      console.error('Auth check error:', e);
    }
  }

  updateUserUI(user) {
    const authBtns = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const adminBtn = document.getElementById('admin-panel-btn');

    if (user) {
      authBtns.style.display = 'none';
      userMenu.style.display = 'block';
      document.getElementById('user-display-name').textContent = user.name.split(' ')[0];
      document.getElementById('dropdown-user-name').textContent = user.name;
      document.getElementById('dropdown-user-email').textContent = user.email;

      if (user.role === 'admin') {
        adminBtn.style.display = 'inline-flex';
      } else {
        adminBtn.style.display = 'none';
      }
    } else {
      authBtns.style.display = 'flex';
      userMenu.style.display = 'none';
      adminBtn.style.display = 'none';
    }
  }

  openAuthModal(mode = 'login') {
    this.authMode = mode;
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const nameGrp = document.getElementById('name-group');
    const confirmGrp = document.getElementById('confirm-password-group');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const toggleLink = document.getElementById('auth-toggle-link');

    document.getElementById('auth-error-msg').style.display = 'none';

    if (mode === 'signup') {
      title.textContent = 'Create ApexCart Account';
      nameGrp.style.display = 'block';
      confirmGrp.style.display = 'block';
      submitBtn.textContent = 'Sign Up';
      toggleText.textContent = 'Already have an account?';
      toggleLink.textContent = 'Sign in instead';
    } else {
      title.textContent = 'Sign In to ApexCart';
      nameGrp.style.display = 'none';
      confirmGrp.style.display = 'none';
      submitBtn.textContent = 'Sign In';
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = 'Create one now';
    }

    modal.style.display = 'flex';
  }

  closeAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
  }

  switchAuthMode() {
    this.openAuthModal(this.authMode === 'login' ? 'signup' : 'login');
  }

  async handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errBox = document.getElementById('auth-error-msg');
    errBox.style.display = 'none';

    const endpoint = this.authMode === 'signup' ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
    const payload = this.authMode === 'signup' ? {
      user: {
        name: document.getElementById('auth-name').value,
        email,
        password,
        password_confirmation: document.getElementById('auth-confirm-password').value
      }
    } : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        this.authToken = data.token;
        localStorage.setItem('apexcart_token', data.token);
        this.currentUser = data.user;
        this.updateUserUI(data.user);
        this.closeAuthModal();
        this.showToast(`Welcome ${data.user.name}!`);
        await this.fetchCart();
      } else {
        errBox.textContent = data.error || (data.errors ? data.errors.join(', ') : 'Auth failed');
        errBox.style.display = 'block';
      }
    } catch (e) {
      errBox.textContent = 'Network error connecting to server';
      errBox.style.display = 'block';
    }
  }

  async logout() {
    if (this.authToken) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      }).catch(() => {});
    }
    this.authToken = null;
    this.currentUser = null;
    localStorage.removeItem('apexcart_token');
    this.updateUserUI(null);
    this.closeUserDropdown();
    this.showToast('Logged out successfully');
  }

  toggleUserDropdown() {
    const menu = document.getElementById('user-dropdown');
    menu.classList.toggle('show');
  }

  closeUserDropdown() {
    const menu = document.getElementById('user-dropdown');
    menu.classList.remove('show');
  }

  // --- Product Fetching & Display ---
  async fetchProducts() {
    const grid = document.getElementById('product-grid');
    try {
      let url = `${API_BASE}/products`;
      const params = new URLSearchParams();
      if (this.currentCategory) params.append('category', this.currentCategory);
      if (this.searchQuery) params.append('search', this.searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      this.products = data;
      this.renderProducts();
    } catch (e) {
      grid.innerHTML = `<div class="alert alert-danger">Failed to load products from Rails API.</div>`;
    }
  }

  renderProducts() {
    const grid = document.getElementById('product-grid');
    const countLabel = document.getElementById('results-count');

    countLabel.textContent = `Showing ${this.products.length} product(s)`;

    if (this.products.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:3rem;">
        <h3>No Products Found 🔍</h3>
        <p style="color:var(--text-secondary);">Try changing filter category or search keywords.</p>
      </div>`;
      return;
    }

    grid.innerHTML = this.products.map(p => `
      <div class="product-card">
        <div class="card-img-wrapper">
          <img src="${p.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80'}" alt="${p.name}" class="product-img">
          <span class="badge-category">${p.category}</span>
        </div>
        <div class="card-body">
          <h3 class="product-title">${p.name}</h3>
          <p class="product-desc">${p.description || ''}</p>
          <div class="card-footer-row">
            <div class="product-price">$${parseFloat(p.price).toFixed(2)}</div>
            <button class="btn btn-primary" onclick="app.addToCart(${p.id})">
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  filterCategory(category) {
    this.currentCategory = category;
    document.querySelectorAll('.category-chip').forEach(btn => {
      btn.classList.toggle('active', btn.textContent === (category || 'All Products'));
    });
    this.fetchProducts();
  }

  handleSearch(val) {
    this.searchQuery = val.trim();
    this.fetchProducts();
  }

  // --- Cart Drawer & Operations ---
  async fetchCart() {
    try {
      const headers = {};
      if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;
      
      const res = await fetch(`${API_BASE}/cart`, { headers });
      if (res.ok) {
        this.cart = await res.json();
        this.updateCartUI();
      }
    } catch (e) {
      console.error('Fetch cart error:', e);
    }
  }

  updateCartUI() {
    document.getElementById('cart-count').textContent = this.cart.item_count || 0;
    document.getElementById('cart-subtotal').textContent = `$${(this.cart.total_price || 0).toFixed(2)}`;
    this.renderCartItems();
  }

  renderCartItems() {
    const body = document.getElementById('cart-drawer-body');
    if (!this.cart.items || this.cart.items.length === 0) {
      body.innerHTML = `<div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
        <p style="font-size:3rem;">🛒</p>
        <h4>Your cart is empty</h4>
        <p style="font-size:0.85rem;">Add some products to get started!</p>
      </div>`;
      document.getElementById('checkout-btn').disabled = true;
      return;
    }

    document.getElementById('checkout-btn').disabled = false;
    body.innerHTML = this.cart.items.map(item => `
      <div class="cart-item-card">
        <img src="${item.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80'}" class="cart-item-img">
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">$${parseFloat(item.price).toFixed(2)} each</div>
          <div class="qty-controls">
            <button class="qty-btn" onclick="app.updateCartItemQty(${item.id}, ${item.quantity - 1})">-</button>
            <span style="font-weight:600; padding:0 6px;">${item.quantity}</span>
            <button class="qty-btn" onclick="app.updateCartItemQty(${item.id}, ${item.quantity + 1})">+</button>
            <button style="margin-left:auto; background:none; border:none; color:var(--danger); cursor:pointer;" onclick="app.removeCartItem(${item.id})">🗑️</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async addToCart(productId) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;

      const res = await fetch(`${API_BASE}/cart/items`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ product_id: productId, quantity: 1 })
      });
      const data = await res.json();
      if (res.ok) {
        this.cart = data.cart;
        this.updateCartUI();
        this.showToast('Item added to cart!');
        this.openCartDrawer();
      }
    } catch (e) {
      this.showToast('Failed to add item to cart', 'danger');
    }
  }

  async updateCartItemQty(itemId, newQty) {
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;

      const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity: newQty })
      });
      const data = await res.json();
      if (res.ok) {
        this.cart = data.cart;
        this.updateCartUI();
      }
    } catch (e) {
      console.error(e);
    }
  }

  async removeCartItem(itemId) {
    try {
      const headers = {};
      if (this.authToken) headers['Authorization'] = `Bearer ${this.authToken}`;

      const res = await fetch(`${API_BASE}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (res.ok) {
        this.cart = data.cart;
        this.updateCartUI();
      }
    } catch (e) {
      console.error(e);
    }
  }

  openCartDrawer() {
    document.getElementById('cart-drawer').classList.add('open');
    document.getElementById('cart-drawer-overlay').style.display = 'block';
  }

  closeCartDrawer() {
    document.getElementById('cart-drawer').classList.remove('open');
    document.getElementById('cart-drawer-overlay').style.display = 'none';
  }

  // --- Checkout & Payment Flow ---
  startCheckout() {
    if (!this.currentUser) {
      this.closeCartDrawer();
      this.openAuthModal('login');
      this.showToast('Please sign in to complete checkout', 'warning');
      return;
    }

    this.closeCartDrawer();
    const modal = document.getElementById('checkout-modal');
    
    // Auto-fill shipping details
    document.getElementById('ship-name').value = this.currentUser.name || '';
    document.getElementById('ship-address').value = this.currentUser.address || '';

    // Render items summary
    const summaryItems = document.getElementById('checkout-summary-items');
    summaryItems.innerHTML = this.cart.items.map(i => `
      <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
        <span>${i.name} (x${i.quantity})</span>
        <strong>$${i.total_price.toFixed(2)}</strong>
      </div>
    `).join('');

    document.getElementById('chk-items-total').textContent = `$${this.cart.total_price.toFixed(2)}`;
    document.getElementById('chk-grand-total').textContent = `$${this.cart.total_price.toFixed(2)}`;

    modal.style.display = 'flex';
  }

  closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
  }

  async processOrderCheckout(e) {
    e.preventDefault();
    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Processing Order & Payment...';

    const shipping_name = document.getElementById('ship-name').value;
    const shipping_address = document.getElementById('ship-address').value;
    const shipping_city = document.getElementById('ship-city').value;
    const shipping_zip = document.getElementById('ship-zip').value;
    const payment_method = document.querySelector('input[name="pay-method"]:checked').value;

    try {
      // 1. Create Order
      const resOrder = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ shipping_name, shipping_address, shipping_city, shipping_zip })
      });

      const orderData = await resOrder.json();
      if (!resOrder.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      const order = orderData.order;

      // 2. Process Payment
      const resPay = await fetch(`${API_BASE}/payments/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ order_id: order.id, payment_method })
      });

      const payData = await resPay.json();
      if (resPay.ok) {
        this.closeCheckoutModal();
        await this.fetchCart();
        this.showToast(`Order #${order.order_number} confirmed & paid! 🚀`);
        this.openOrdersModal();
      } else {
        throw new Error(payData.error || 'Payment failed');
      }

    } catch (err) {
      const errBox = document.getElementById('checkout-error');
      errBox.textContent = err.message;
      errBox.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Pay Now & Confirm Order 🚀';
    }
  }

  // --- Orders & Status Tracking Modal ---
  async openOrdersModal() {
    this.closeUserDropdown();
    const modal = document.getElementById('orders-modal');
    modal.style.display = 'flex';

    const body = document.getElementById('orders-list-body');
    body.innerHTML = `<div style="text-align:center; padding:2rem;">Loading orders...</div>`;

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      const orders = await res.json();

      if (orders.length === 0) {
        body.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">
          <h4>No Orders Found 📦</h4>
          <p>Place an order to see its status here.</p>
        </div>`;
        return;
      }

      body.innerHTML = orders.map(o => `
        <div class="order-card">
          <div class="order-card-header">
            <div>
              <strong>Order #${o.order_number}</strong>
              <div style="font-size:0.8rem; color:var(--text-secondary);">${new Date(o.created_at).toLocaleString()}</div>
            </div>
            <span class="status-badge status-${o.status}">${o.status}</span>
          </div>

          <div style="display:flex; justify-content:space-between; font-size:0.9rem; margin-bottom:0.8rem;">
            <span>Recipient: <strong>${o.shipping_name}</strong></span>
            <span>Total: <strong>$${parseFloat(o.total_amount).toFixed(2)}</strong></span>
          </div>

          <!-- Status Timeline Bar -->
          <div style="background:var(--bg-card); padding:0.8rem; border-radius:8px; margin-top:0.8rem;">
            <div style="font-size:0.8rem; font-weight:600; margin-bottom:0.4rem; color:var(--text-secondary);">Tracking Timeline:</div>
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; text-align:center;">
              <span style="color:${['pending','paid','processing','shipped','delivered'].includes(o.status)?'var(--success)':'var(--text-muted)'}">1. Placed</span>
              <span style="color:${['paid','processing','shipped','delivered'].includes(o.status)?'var(--success)':'var(--text-muted)'}">2. Paid</span>
              <span style="color:${['processing','shipped','delivered'].includes(o.status)?'var(--success)':'var(--text-muted)'}">3. Processing</span>
              <span style="color:${['shipped','delivered'].includes(o.status)?'var(--success)':'var(--text-muted)'}">4. Shipped</span>
              <span style="color:${o.status==='delivered'?'var(--success)':'var(--text-muted)'}">5. Delivered</span>
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      body.innerHTML = `<div class="alert alert-danger">Failed to fetch order history.</div>`;
    }
  }

  closeOrdersModal() {
    document.getElementById('orders-modal').style.display = 'none';
  }

  // --- Admin Studio & CRUD ---
  toggleAdminModal() {
    const modal = document.getElementById('admin-modal');
    modal.style.display = 'flex';
    this.loadAdminProducts();
  }

  closeAdminModal() {
    document.getElementById('admin-modal').style.display = 'none';
  }

  switchAdminTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    if (tab === 'products') {
      document.getElementById('tab-products-btn').classList.add('active');
      document.getElementById('admin-tab-products').classList.add('active');
      this.loadAdminProducts();
    } else {
      document.getElementById('tab-orders-btn').classList.add('active');
      document.getElementById('admin-tab-orders').classList.add('active');
      this.loadAdminOrders();
    }
  }

  async loadAdminProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    try {
      const res = await fetch(`${API_BASE}/products`);
      const products = await res.json();

      tbody.innerHTML = products.map(p => `
        <tr>
          <td><strong>${p.name}</strong></td>
          <td><code>${p.sku}</code></td>
          <td>${p.category}</td>
          <td>$${parseFloat(p.price).toFixed(2)}</td>
          <td>${p.stock_quantity}</td>
          <td><span class="status-badge status-${p.active ? 'paid' : 'cancelled'}">${p.active ? 'Active' : 'Draft'}</span></td>
          <td>
            <button class="btn btn-secondary" style="padding:2px 8px; font-size:0.75rem;" onclick="app.editProduct(${p.id})">✏️ Edit</button>
            <button class="btn btn-outline" style="padding:2px 8px; font-size:0.75rem; color:var(--danger);" onclick="app.deleteProduct(${p.id})">🗑️ Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7">Failed to load admin products</td></tr>`;
    }
  }

  openAddProductForm() {
    this.editingProductId = null;
    document.getElementById('product-form-title').textContent = 'Create New Product';
    document.getElementById('product-crud-form').reset();
    document.getElementById('product-form-container').style.display = 'block';
  }

  closeProductForm() {
    document.getElementById('product-form-container').style.display = 'none';
  }

  editProduct(id) {
    const p = this.products.find(item => item.id === id);
    if (!p) return;

    this.editingProductId = id;
    document.getElementById('product-form-title').textContent = `Edit Product #${id}`;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-sku').value = p.sku;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-stock').value = p.stock_quantity;
    document.getElementById('prod-image').value = p.image_url || '';
    document.getElementById('prod-description').value = p.description || '';

    document.getElementById('product-form-container').style.display = 'block';
  }

  async handleProductCrudSubmit(e) {
    e.preventDefault();
    const payload = {
      product: {
        name: document.getElementById('prod-name').value,
        sku: document.getElementById('prod-sku').value,
        price: parseFloat(document.getElementById('prod-price').value),
        category: document.getElementById('prod-category').value,
        stock_quantity: parseInt(document.getElementById('prod-stock').value),
        image_url: document.getElementById('prod-image').value,
        description: document.getElementById('prod-description').value
      }
    };

    const url = this.editingProductId ? `${API_BASE}/products/${this.editingProductId}` : `${API_BASE}/products`;
    const method = this.editingProductId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.showToast(this.editingProductId ? 'Product updated!' : 'Product created!');
        this.closeProductForm();
        this.loadAdminProducts();
        this.fetchProducts();
      } else {
        const err = await res.json();
        alert(err.errors ? err.errors.join('\n') : 'Save failed');
      }
    } catch (e) {
      alert('Network error while saving product');
    }
  }

  async deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      if (res.ok) {
        this.showToast('Product deleted');
        this.loadAdminProducts();
        this.fetchProducts();
      }
    } catch (e) {
      alert('Delete failed');
    }
  }

  async loadAdminOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${this.authToken}` }
      });
      const orders = await res.json();

      tbody.innerHTML = orders.map(o => `
        <tr>
          <td><code>${o.order_number}</code></td>
          <td>${o.user.name} (${o.user.email})</td>
          <td>$${parseFloat(o.total_amount).toFixed(2)}</td>
          <td><span class="status-badge status-${o.status}">${o.status}</span></td>
          <td>${o.payment_status}</td>
          <td>${new Date(o.created_at).toLocaleDateString()}</td>
          <td>
            <select class="form-control" style="padding:2px 6px; font-size:0.8rem;" onchange="app.changeOrderStatus(${o.id}, this.value)">
              <option value="pending" ${o.status==='pending'?'selected':''}>pending</option>
              <option value="paid" ${o.status==='paid'?'selected':''}>paid</option>
              <option value="processing" ${o.status==='processing'?'selected':''}>processing</option>
              <option value="shipped" ${o.status==='shipped'?'selected':''}>shipped</option>
              <option value="delivered" ${o.status==='delivered'?'selected':''}>delivered</option>
              <option value="cancelled" ${o.status==='cancelled'?'selected':''}>cancelled</option>
            </select>
          </td>
        </tr>
      `).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7">Failed to load admin orders</td></tr>`;
    }
  }

  async changeOrderStatus(orderId, newStatus) {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        this.showToast(`Order #${orderId} status changed to ${newStatus}`);
        this.loadAdminOrders();
      }
    } catch (e) {
      alert('Failed to update status');
    }
  }

  // --- Toast Utilities ---
  showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  setupEventListeners() {
    window.addEventListener('click', (e) => {
      const userMenu = document.getElementById('user-menu');
      if (userMenu && !userMenu.contains(e.target)) {
        this.closeUserDropdown();
      }
    });
  }
}

// Global App Instance
const app = new ApexCartApp();
