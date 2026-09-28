class CreatePayments < ActiveRecord::Migration[7.1]
  def change
    create_table :payments do |t|
      t.references :order, null: false, foreign_key: true
      t.string :payment_method, null: false
      t.string :transaction_id, null: false
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :status, default: "pending", null: false
      t.datetime :paid_at

      t.timestamps
    end
    add_index :payments, :transaction_id, unique: true
  end
end
