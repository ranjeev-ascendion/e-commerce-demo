class Product < ApplicationRecord
  has_many :cart_items, dependent: :destroy
  has_many :order_items, dependent: :nullify

  validates :name, presence: true
  validates :price, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :sku, presence: true, uniqueness: true
  validates :stock_quantity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  scope :active, -> { where(active: true) }
  scope :by_category, ->(category) { where(category: category) if category.present? }
  scope :search_by_name, ->(query) { where("name LIKE ?", "%#{query}%") if query.present? }

  def available?
    active && stock_quantity > 0
  end
end
