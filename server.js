const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Mock Data Models mirroring Rails Seeds & ActiveRecord
let users = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@store.com",
    password: "password123",
    role: "admin",
    phone: "+1 555-0199",
    address: "100 Admin Plaza, Enterprise City",
    auth_token: "token-admin-secret-12345"
  },
  {
    id: 2,
    name: "Jane Doe",
    email: "customer@store.com",
    password: "password123",
    role: "customer",
    phone: "+1 555-0142",
    address: "742 Evergreen Terrace, Springfield",
    auth_token: "token-customer-secret-67890"
  }
];

let products = [
  {
    id: 1,
    name: "Wireless Noise-Canceling Headphones",
    description: "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and high-fidelity sound.",
    price: 249.99,
    sku: "AUDIO-ANC-001",
    category: "Electronics",
    stock_quantity: 45,
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    active: true
  },
  {
    id: 2,
    name: "Ultra-Thin Smart Watch Series X",
    description: "Fitness and health tracking smartwatch with AMOLED display, heart-rate monitoring, and water resistance.",
    price: 199.50,
    sku: "TECH-WATCH-002",
    category: "Electronics",
    stock_quantity: 28,
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    active: true
  },
  {
    id: 3,
    name: "Ergonomic Mechanical Keyboard",
    description: "Custom RGB mechanical keyboard with tactile switches, aluminum frame, and hot-swappable keys.",
    price: 129.00,
    sku: "PERIPH-KEY-003",
    category: "Computers",
    stock_quantity: 60,
    image_url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    active: true
  },
  {
    id: 4,
    name: "Minimalist Leather Backpack",
    description: "Handcrafted genuine leather backpack designed for 15-inch laptops with water-resistant lining.",
    price: 159.95,
    sku: "BAG-LTHR-004",
    category: "Accessories",
    stock_quantity: 15,
    image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    active: true
  },
  {
    id: 5,
    name: "Smart Speaker with AI Voice Assistant",
    description: "360-degree room-filling audio with built-in smart assistant, home automation control, and multi-room sync.",
    price: 89.99,
    sku: "AUDIO-SPK-005",
    category: "Electronics",
    stock_quantity: 80,
    image_url: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=600&q=80",
    active: true
  },
  {
    id: 6,
    name: "Precision Optical Gaming Mouse",
    description: "26,000 DPI optical sensor, ultra-lightweight design, programmable buttons, and zero latency wireless mode.",
    price: 79.99,
    sku: "PERIPH-MSE-006",
    category: "Computers",
    stock_quantity: 50,
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
    active: true
  }
];

let carts = {};
let orders = [];
let payments = [];

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

function parseJSONBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

function getAuthUser(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  return users.find(u => u.auth_token === token) || null;
}

function getCartKey(req, user) {
  return user ? `user_${user.id}` : (req.headers['x-session-id'] || 'guest_session');
}

function getCartObject(key) {
  if (!carts[key]) carts[key] = { items: [] };
  const cart = carts[key];
  cart.total_price = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  cart.item_count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  return cart;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method.toUpperCase();
  const user = getAuthUser(req);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-ID');

  if (method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // --- API Routes ---
  if (pathname.startsWith('/api/v1/')) {
    res.setHeader('Content-Type', 'application/json');

    // 5. Auth Routes
    if (pathname === '/api/v1/auth/signup' && method === 'POST') {
      const body = await parseJSONBody(req);
      const uData = body.user || {};
      if (!uData.email || !uData.password || !uData.name) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Name, email, and password required' }));
      }
      if (users.find(u => u.email === uData.email)) {
        res.writeHead(422);
        return res.end(JSON.stringify({ error: 'Email already registered' }));
      }
      const token = `token-${Date.now()}`;
      const newUser = {
        id: users.length + 1,
        name: uData.name,
        email: uData.email,
        password: uData.password,
        role: 'customer',
        phone: uData.phone || '',
        address: uData.address || '',
        auth_token: token
      };
      users.push(newUser);
      res.writeHead(201);
      return res.end(JSON.stringify({ message: 'User account created', token, user: newUser }));
    }

    if (pathname === '/api/v1/auth/login' && method === 'POST') {
      const body = await parseJSONBody(req);
      const target = users.find(u => u.email === body.email && u.password === body.password);
      if (!target) {
        res.writeHead(401);
        return res.end(JSON.stringify({ error: 'Invalid email or password' }));
      }
      if (!target.auth_token) target.auth_token = `token-${Date.now()}`;
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Login successful', token: target.auth_token, user: target }));
    }

    if (pathname === '/api/v1/auth/logout' && method === 'DELETE') {
      if (user) user.auth_token = `token-${Date.now()}`;
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Logged out successfully' }));
    }

    if (pathname === '/api/v1/auth/me' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify({ user: user || null }));
    }

    // 4. Users API
    if (pathname === '/api/v1/users' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify(users));
    }

    // 1. Products API
    if (pathname === '/api/v1/products' && method === 'GET') {
      let list = [...products];
      if (parsedUrl.query.category) {
        list = list.filter(p => p.category.toLowerCase() === parsedUrl.query.category.toLowerCase());
      }
      if (parsedUrl.query.search) {
        const q = parsedUrl.query.search.toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
      }
      res.writeHead(200);
      return res.end(JSON.stringify(list));
    }

    const prodMatch = pathname.match(/^\/api\/v1\/products\/(\d+)$/);
    if (prodMatch) {
      const pId = parseInt(prodMatch[1]);
      const p = products.find(prod => prod.id === pId);

      if (method === 'GET') {
        if (!p) { res.writeHead(404); return res.end(JSON.stringify({ error: 'Product not found' })); }
        res.writeHead(200);
        return res.end(JSON.stringify(p));
      }

      if (method === 'PUT' || method === 'PATCH') {
        if (!p) { res.writeHead(404); return res.end(JSON.stringify({ error: 'Product not found' })); }
        const body = await parseJSONBody(req);
        Object.assign(p, body.product || {});
        res.writeHead(200);
        return res.end(JSON.stringify({ message: 'Product updated', product: p }));
      }

      if (method === 'DELETE') {
        const idx = products.findIndex(prod => prod.id === pId);
        if (idx !== -1) products.splice(idx, 1);
        res.writeHead(200);
        return res.end(JSON.stringify({ message: 'Product deleted' }));
      }
    }

    if (pathname === '/api/v1/products' && method === 'POST') {
      const body = await parseJSONBody(req);
      const pData = body.product || {};
      const newProduct = {
        id: products.length + 1,
        name: pData.name,
        description: pData.description,
        price: parseFloat(pData.price || 0),
        sku: pData.sku || `SKU-${Date.now()}`,
        category: pData.category || 'General',
        stock_quantity: parseInt(pData.stock_quantity || 10),
        image_url: pData.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80',
        active: true
      };
      products.push(newProduct);
      res.writeHead(201);
      return res.end(JSON.stringify({ message: 'Product created', product: newProduct }));
    }

    // 3. Cart API
    const cartKey = getCartKey(req, user);

    if (pathname === '/api/v1/cart' && method === 'GET') {
      res.writeHead(200);
      return res.end(JSON.stringify(getCartObject(cartKey)));
    }

    if (pathname === '/api/v1/cart/items' && method === 'POST') {
      const body = await parseJSONBody(req);
      const cart = getCartObject(cartKey);
      const prod = products.find(p => p.id === parseInt(body.product_id));
      if (!prod) { res.writeHead(404); return res.end(JSON.stringify({ error: 'Product not found' })); }

      const qty = parseInt(body.quantity || 1);
      let item = cart.items.find(i => i.product_id === prod.id);
      if (item) {
        item.quantity += qty;
      } else {
        item = {
          id: cart.items.length + 1,
          product_id: prod.id,
          name: prod.name,
          price: prod.price,
          quantity: qty,
          image_url: prod.image_url
        };
        cart.items.push(item);
      }
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Item added', cart: getCartObject(cartKey) }));
    }

    const cartItemMatch = pathname.match(/^\/api\/v1\/cart\/items\/(\d+)$/);
    if (cartItemMatch) {
      const itemId = parseInt(cartItemMatch[1]);
      const cart = getCartObject(cartKey);

      if (method === 'PUT') {
        const body = await parseJSONBody(req);
        const idx = cart.items.findIndex(i => i.id === itemId);
        if (idx !== -1) {
          if (parseInt(body.quantity) <= 0) cart.items.splice(idx, 1);
          else cart.items[idx].quantity = parseInt(body.quantity);
        }
        res.writeHead(200);
        return res.end(JSON.stringify({ message: 'Cart updated', cart: getCartObject(cartKey) }));
      }

      if (method === 'DELETE') {
        cart.items = cart.items.filter(i => i.id !== itemId);
        res.writeHead(200);
        return res.end(JSON.stringify({ message: 'Item removed', cart: getCartObject(cartKey) }));
      }
    }

    if (pathname === '/api/v1/cart/clear' && method === 'DELETE') {
      if (carts[cartKey]) carts[cartKey].items = [];
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Cart cleared', cart: getCartObject(cartKey) }));
    }

    // 2 & 7. Orders & Order Status API
    if (pathname === '/api/v1/orders' && method === 'GET') {
      if (!user) { res.writeHead(401); return res.end(JSON.stringify({ error: 'Unauthorized' })); }
      const userOrders = user.role === 'admin' ? orders : orders.filter(o => o.user.id === user.id);
      res.writeHead(200);
      return res.end(JSON.stringify(userOrders));
    }

    if (pathname === '/api/v1/orders' && method === 'POST') {
      if (!user) { res.writeHead(401); return res.end(JSON.stringify({ error: 'Unauthorized' })); }
      const cart = getCartObject(cartKey);
      if (cart.items.length === 0) { res.writeHead(400); return res.end(JSON.stringify({ error: 'Cart is empty' })); }

      const body = await parseJSONBody(req);
      const newOrder = {
        id: orders.length + 1,
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        status: 'pending',
        total_amount: cart.total_price,
        shipping_name: body.shipping_name || user.name,
        shipping_address: body.shipping_address || user.address,
        shipping_city: body.shipping_city || 'Springfield',
        shipping_zip: body.shipping_zip || '90210',
        payment_status: 'unpaid',
        created_at: new Date().toISOString(),
        user: { id: user.id, name: user.name, email: user.email },
        order_items: [...cart.items]
      };
      orders.unshift(newOrder);
      carts[cartKey].items = [];
      res.writeHead(201);
      return res.end(JSON.stringify({ message: 'Order created', order: newOrder }));
    }

    const orderStatusMatch = pathname.match(/^\/api\/v1\/orders\/(\d+)\/status$/);
    if (orderStatusMatch && method === 'PATCH') {
      const order = orders.find(o => o.id === parseInt(orderStatusMatch[1]));
      if (!order) { res.writeHead(404); return res.end(JSON.stringify({ error: 'Order not found' })); }
      const body = await parseJSONBody(req);
      order.status = body.status || order.status;
      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Order status updated', order }));
    }

    // 6. Payments API
    if (pathname === '/api/v1/payments/process' && method === 'POST') {
      const body = await parseJSONBody(req);
      const order = orders.find(o => o.id === parseInt(body.order_id));
      if (!order) { res.writeHead(404); return res.end(JSON.stringify({ error: 'Order not found' })); }

      const payment = {
        id: payments.length + 1,
        order_id: order.id,
        transaction_id: `TXN-${Date.now()}`,
        payment_method: body.payment_method || 'credit_card',
        amount: order.total_amount,
        status: 'success',
        paid_at: new Date().toISOString()
      };
      payments.push(payment);
      order.status = 'paid';
      order.payment_status = 'paid';

      res.writeHead(200);
      return res.end(JSON.stringify({ message: 'Payment successful', payment }));
    }

    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'API endpoint not found' }));
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || 'text/html';
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end('Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`ApexCart Rails & Preview Server Running!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`====================================================`);
});
