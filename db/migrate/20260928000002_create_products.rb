class CreateProducts < ActiveRecord::Migration[7.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.decimal :price, precision: 10, scale: 2, null: false
      t.string :sku, null: false
      t.string :category, null: false
      t.integer :stock_quantity, default: 0, null: false
      t.string :image_url
      t.boolean :active, default: true, null: false

      t.timestamps
    end
    add_index :products, :sku, unique: true
    add_index :products, :category
  end
end
