module Api
  module V1
    class OrdersController < ApplicationController
      before_action :authenticate_user!
      before_action :authorize_admin!, only: [:update_status]

      # GET /api/v1/orders
      def index
        orders = if current_user.admin?
          Order.all.order(created_at: :desc)
        else
          current_user.orders.order(created_at: :desc)
        end

        render json: orders.map { |o| serialize_order(o) }, status: :ok
      end

      # GET /api/v1/orders/:id
      def show
        order = if current_user.admin?
          Order.find_by(id: params[:id])
        else
          current_user.orders.find_by(id: params[:id])
        end

        return render json: { error: "Order not found" }, status: :not_found unless order

        render json: serialize_order(order, include_items: true), status: :ok
      end

      # POST /api/v1/orders
      def create
        cart = current_cart
        return render json: { error: "Cart is empty" }, status: :unprocessable_entity if cart.cart_items.empty?

        order = current_user.orders.build(
          total_amount: cart.total_price,
          status: "pending",
          shipping_name: params[:shipping_name] || current_user.name,
          shipping_address: params[:shipping_address] || current_user.address,
          shipping_city: params[:shipping_city] || "Springfield",
          shipping_zip: params[:shipping_zip] || "90210"
        )

        ActiveRecord::Base.transaction do
          order.save!

          cart.cart_items.each do |ci|
            order.order_items.create!(
              product: ci.product,
              product_name: ci.product.name,
              quantity: ci.quantity,
              unit_price: ci.product.price,
              subtotal: ci.total_price
            )
            # Update stock quantity
            ci.product.update!(stock_quantity: [0, ci.product.stock_quantity - ci.quantity].max)
          end

          cart.clear!
        end

        render json: { message: "Order placed successfully", order: serialize_order(order, include_items: true) }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      # PATCH /api/v1/orders/:id/status
      def update_status
        order = Order.find_by(id: params[:id])
        return render json: { error: "Order not found" }, status: :not_found unless order

        new_status = params[:status]
        unless Order::STATUSES.include?(new_status)
          return render json: { error: "Invalid order status. Must be one of: #{Order::STATUSES.join(', ')}" }, status: :unprocessable_entity
        end

        order.update!(status: new_status)
        render json: { message: "Order status updated successfully", order: serialize_order(order) }, status: :ok
      end

      private

      def serialize_order(order, include_items: false)
        data = {
          id: order.id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          shipping_name: order.shipping_name,
          shipping_address: order.shipping_address,
          shipping_city: order.shipping_city,
          shipping_zip: order.shipping_zip,
          payment_status: order.payment_status,
          created_at: order.created_at,
          user: {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email
          }
        }

        if include_items
          data[:order_items] = order.order_items.map do |item|
            {
              id: item.id,
              product_id: item.product_id,
              product_name: item.product_name,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal
            }
          end
          data[:payment] = order.payment ? {
            transaction_id: order.payment.transaction_id,
            payment_method: order.payment.payment_method,
            amount: order.payment.amount,
            status: order.payment.status,
            paid_at: order.payment.paid_at
          } : nil
        end

        data
      end
    end
  end
end
