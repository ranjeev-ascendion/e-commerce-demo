class CreateOrders < ActiveRecord::Migration[7.1]
  def change
    create_table :orders do |t|
      t.references :user, null: false, foreign_key: true
      t.string :order_number, null: false
      t.string :status, default: "pending", null: false
      t.decimal :total_amount, precision: 10, scale: 2, null: false
      t.string :shipping_name
      t.text :shipping_address
      t.string :shipping_city
      t.string :shipping_zip
      t.string :payment_status, default: "unpaid"

      t.timestamps
    end
    add_index :orders, :order_number, unique: true
    add_index :orders, :status
  end
end
