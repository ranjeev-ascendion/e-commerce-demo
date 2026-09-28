class Order < ApplicationRecord
  belongs_to :user
  has_many :order_items, dependent: :destroy
  has_one :payment, dependent: :destroy

  STATUSES = %w[pending paid processing shipped delivered cancelled].freeze

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :order_number, presence: true, uniqueness: true
  validates :total_amount, presence: true, numericality: { greater_than_or_equal_to: 0 }

  before_validation :generate_order_number, on: :create

  private

  def generate_order_number
    self.order_number ||= "ORD-#{Time.now.strftime('%Y%m%d')}-#{SecureRandom.hex(4).upcase}"
  end
end
