module Api
  module V1
    class CartsController < ApplicationController
      # GET /api/v1/cart
      def show
        cart = current_cart
        render json: {
          id: cart.id,
          total_price: cart.total_price,
          item_count: cart.item_count,
          items: cart.cart_items.includes(:product).map do |item|
            {
              id: item.id,
              product_id: item.product_id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              total_price: item.total_price,
              image_url: item.product.image_url
            }
          end
        }, status: :ok
      end

      # POST /api/v1/cart/items
      def add_item
        cart = current_cart
        product = Product.find_by(id: params[:product_id])
        return render json: { error: "Product not found" }, status: :not_found unless product

        quantity = params[:quantity].to_i
        quantity = 1 if quantity <= 0

        item = cart.cart_items.find_by(product_id: product.id)
        if item
          item.quantity += quantity
        else
          item = cart.cart_items.build(product: product, quantity: quantity)
        end

        if item.save
          render json: { message: "Item added to cart", cart: show_cart_json(cart) }, status: :ok
        else
          render json: { errors: item.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT /api/v1/cart/items/:id
      def update_item
        cart = current_cart
        item = cart.cart_items.find_by(id: params[:id])
        return render json: { error: "Cart item not found" }, status: :not_found unless item

        quantity = params[:quantity].to_i
        if quantity <= 0
          item.destroy
        else
          item.update(quantity: quantity)
        end

        render json: { message: "Cart item updated", cart: show_cart_json(cart) }, status: :ok
      end

      # DELETE /api/v1/cart/items/:id
      def remove_item
        cart = current_cart
        item = cart.cart_items.find_by(id: params[:id])
        item&.destroy
        render json: { message: "Item removed from cart", cart: show_cart_json(cart) }, status: :ok
      end

      # DELETE /api/v1/cart/clear
      def clear
        cart = current_cart
        cart.clear!
        render json: { message: "Cart cleared", cart: show_cart_json(cart) }, status: :ok
      end

      private

      def show_cart_json(cart)
        {
          id: cart.id,
          total_price: cart.total_price,
          item_count: cart.item_count,
          items: cart.cart_items.includes(:product).map do |item|
            {
              id: item.id,
              product_id: item.product_id,
              name: item.product.name,
              price: item.product.price,
              quantity: item.quantity,
              total_price: item.total_price,
              image_url: item.product.image_url
            }
          end
        }
      end
    end
  end
end
