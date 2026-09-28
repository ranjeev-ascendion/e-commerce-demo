class CreateCarts < ActiveRecord::Migration[7.1]
  def change
    create_table :carts do |t|
      t.references :user, foreign_key: true
      t.string :session_id

      t.timestamps
    end
    add_index :carts, :session_id
  end
end
