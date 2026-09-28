class User < ApplicationRecord
  has_secure_password

  has_many :orders, dependent: :destroy
  has_one :cart, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, presence: true, inclusion: { in: %w[customer admin] }

  before_create :generate_auth_token

  def admin?
    role == "admin"
  end

  def generate_auth_token
    self.auth_token ||= SecureRandom.hex(32)
  end

  def as_json(options = {})
    super(options.merge(except: [:password_digest]))
  end
end
