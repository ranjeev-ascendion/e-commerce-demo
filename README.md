# ApexCart - Ruby on Rails E-Commerce App (API & Frontend)

A full-featured demo e-commerce application built with **Ruby on Rails 7 scaffolding architecture**, featuring a RESTful API backend, Active Record models with SQLite database, BCrypt authentication, and a rich dynamic frontend.

---

## 🚀 Key Features & Implementation

| Feature Area | Details & Highlights |
| :--- | :--- |
| **1. Product CRUD** | Complete RESTful endpoints (`/api/v1/products`), category filters, search, stock tracking, and admin CRUD controls. |
| **2. Orders** | Checkout flow, order line items calculation, unique order number generation, and user order history. |
| **3. Cart** | Guest and session/user bound shopping cart, real-time item badge updates, quantity modification, and line total calculation. |
| **4. Users** | User profile model (`User`), roles (`customer`, `admin`), phone, and shipping address management. |
| **5. User Account (Auth)** | Secure password hashing (`has_secure_password`), signup, login, logout, and token authentication (`/api/v1/auth/*`). |
| **6. Payments** | Payment processing simulation (`/api/v1/payments/process`), transaction ID generation, payment method options (Credit Card, PayPal), and status receipts. |
| **7. Order Status** | Order status lifecycle (`pending` ➔ `paid` ➔ `processing` ➔ `shipped` ➔ `delivered` ➔ `cancelled`), tracking timeline view, and admin status updates. |

---

## 📁 Rails Directory Structure

```text
rails_ecommerce_app/
├── Gemfile                      # Rails 7, SQLite3, Puma, BCrypt, Rack-CORS, JWT
├── Rakefile                     # Rails Rake tasks
├── config.ru                    # Rack application entry
├── server.js                    # Node.js dev server & preview runner
├── app/
│   ├── controllers/
│   │   ├── application_controller.rb
│   │   ├── home_controller.rb
│   │   └── api/
│   │       └── v1/
│   │           ├── auth_controller.rb
│   │           ├── products_controller.rb
│   │           ├── carts_controller.rb
│   │           ├── orders_controller.rb
│   │           ├── payments_controller.rb
│   │           └── users_controller.rb
│   └── models/
│       ├── user.rb
│       ├── product.rb
│       ├── cart.rb
│       ├── cart_item.rb
│       ├── order.rb
│       ├── order_item.rb
│       └── payment.rb
├── config/
│   ├── application.rb
│   ├── routes.rb
│   ├── database.yml
│   └── initializers/
│       └── cors.rb
├── db/
│   ├── seeds.rb
│   └── migrate/
│       ├── 20260928000001_create_users.rb
│       ├── 20260928000002_create_products.rb
│       ├── 20260928000003_create_carts.rb
│       ├── 20260928000004_create_cart_items.rb
│       ├── 20260928000005_create_orders.rb
│       ├── 20260928000006_create_order_items.rb
│       └── 20260928000007_create_payments.rb
└── public/
    ├── index.html               # Main Single Page Application interface
    ├── styles.css               # Modern dark mode & CSS design system
    └── app.js                   # Client state management & Rails API integration
```

---

## 🛠️ How to Run the Application

### Option A: Running with Node.js Dev Preview Server (Recommended for immediate testing)
```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start
```
Open **`http://localhost:3000`** in your web browser.

### Option B: Running with Ruby on Rails
```bash
# 1. Install Gems
bundle install

# 2. Setup Database & Run Migrations
bin/rails db:create db:migrate db:seed

# 3. Start Rails Server
bin/rails server -p 3000
```
Open **`http://localhost:3000`** in your web browser.

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin User** | `admin@store.com` | `password123` |
| **Customer User** | `customer@store.com` | `password123` |

---

## 🔌 API Endpoints Reference

### Auth & User Account
- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/login` - Authenticate and retrieve token
- `DELETE /api/v1/auth/logout` - Logout active user
- `GET /api/v1/auth/me` - Get logged-in user profile

### Products (CRUD)
- `GET /api/v1/products` - List products (supports `?category=` & `?search=`)
- `GET /api/v1/products/:id` - Show single product details
- `POST /api/v1/products` - Create new product (Admin)
- `PUT /api/v1/products/:id` - Update existing product (Admin)
- `DELETE /api/v1/products/:id` - Delete product (Admin)

### Cart
- `GET /api/v1/cart` - Get current cart contents & total
- `POST /api/v1/cart/items` - Add product to cart
- `PUT /api/v1/cart/items/:id` - Update item quantity
- `DELETE /api/v1/cart/items/:id` - Remove item from cart
- `DELETE /api/v1/cart/clear` - Clear entire cart

### Orders & Status
- `GET /api/v1/orders` - View user orders / All orders (Admin)
- `POST /api/v1/orders` - Checkout cart and place new order
- `PATCH /api/v1/orders/:id/status` - Update order status (Admin)

### Payments
- `POST /api/v1/payments/process` - Process payment for order
- `GET /api/v1/payments/:id` - Retrieve payment transaction receipt
