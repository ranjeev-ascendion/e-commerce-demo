class Payment < ApplicationRecord
  belongs_to :order

  STATUSES = %w[pending success failed refunded].freeze

  validates :status, presence: true, inclusion: { in: STATUSES }
  validates :payment_method, presence: true
  validates :transaction_id, presence: true, uniqueness: true
  validates :amount, presence: true, numericality: { greater_than_or_equal_to: 0 }

  before_validation :generate_transaction_id, on: :create

  private

  def generate_transaction_id
    self.transaction_id ||= "TXN-#{Time.now.to_i}-#{SecureRandom.hex(4).upcase}"
  end
end
