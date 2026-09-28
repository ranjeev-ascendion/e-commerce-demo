# Seed Users
admin = User.create!(
  name: "Admin User",
  email: "admin@store.com",
  password: "password123",
  password_confirmation: "password123",
  role: "admin",
  phone: "+1 555-0199",
  address: "100 Admin Plaza, Enterprise City"
)

customer = User.create!(
  name: "Jane Doe",
  email: "customer@store.com",
  password: "password123",
  password_confirmation: "password123",
  role: "customer",
  phone: "+1 555-0142",
  address: "742 Evergreen Terrace, Springfield"
)

# Seed Products
products_data = [
  {
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
    name: "Precision Optical Gaming Mouse",
    description: "26,000 DPI optical sensor, ultra-lightweight design, programmable buttons, and zero latency wireless mode.",
    price: 79.99,
    sku: "PERIPH-MSE-006",
    category: "Computers",
    stock_quantity: 50,
    image_url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
    active: true
  }
]

products_data.each { |p| Product.create!(p) }

puts "Seed data successfully created!"
puts "Admin User: admin@store.com / password123"
puts "Customer User: customer@store.com / password123"
