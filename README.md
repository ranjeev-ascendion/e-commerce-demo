# ApexCart - Ruby on Rails E-Commerce App (API & Frontend)

A full-featured demo e-commerce application built with **Ruby on Rails 7 scaffolding architecture**, featuring a RESTful API backend, Active Record models with SQLite database, BCrypt authentication, and a rich dynamic frontend.

---

## 🛠️ Complete App Setup Guide

### 📋 1. Prerequisites
Ensure you have the following installed on your machine:
- **Ruby**: 3.0.0 or higher (`ruby -v`)
- **Rails**: 7.1.0 or higher (`rails -v`)
- **SQLite3**: 1.6 or higher (`sqlite3 --version`)
- **Node.js** *(Optional for quick preview server)*: v18.0.0 or higher (`node -v`)
- **Git**: (`git --version`)

---

### ⚙️ 2. Step-by-Step Installation & Setup

#### Step 1: Clone the Repository
```bash
git clone https://github.com/ranjeev-ascendion/e-commerce-demo.git
cd e-commerce-demo
```

#### Step 2: Install Dependencies & Setup Environment
```bash
# Install Ruby gem dependencies
bundle install
```

#### Step 3: Database Setup & Migration
Initialize SQLite database, run Active Record schema migrations, and load seed data:
```bash
# Create database, run migrations, and load sample products & users
bin/rails db:create
bin/rails db:migrate
bin/rails db:seed
```

#### Step 4: Start the Ruby on Rails Server
```bash
# Start Puma web server on port 3000
bin/rails server -p 3000
```
Open **`http://localhost:3000`** in your browser to view the application!

---

### ⚡ Quick Preview Mode (Zero-Dependency Node Server)
If Ruby is not installed natively on your host environment, you can run the instant preview server:
```bash
# Runs immediately using Node.js built-in HTTP server (no npm install required)
node server.js
```
Open **`http://localhost:3000`** in your web browser.

---

## 🔑 Demo Accounts

| Role | Email | Password | Features |
| :--- | :--- | :--- | :--- |
| **Admin User** | `admin@store.com` | `password123` | Full Product CRUD, Stock Management, Fulfillment & Order Status updates |
| **Customer User** | `customer@store.com` | `password123` | Browse products, Cart management, Checkout, Payment processing & Order tracking |

---

## 🚀 Push Changes to GitHub Master Branch

To push changes to the remote repository on the `master` branch:

```bash
# 1. Initialize and configure local repo
git init
git config user.name "Ranjeev Kumar"
git config user.email "ranjeevkumar.s@ascendion.com"

# 2. Stage and commit changes
git add .
git commit -m "Update README with detailed app setup steps"

# 3. Ensure branch is set to master
git branch -M master

# 4. Add remote origin
git remote add origin https://github.com/ranjeev-ascendion/e-commerce-demo.git

# 5. Push to GitHub master branch
git push -u origin master
```

*Note: GitHub requires a Personal Access Token (PAT) for HTTPS authentication instead of password.*

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
