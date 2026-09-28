module Api
  module V1
    class PaymentsController < ApplicationController
      before_action :authenticate_user!

      # POST /api/v1/payments/process
      def process_payment
        order = current_user.orders.find_by(id: params[:order_id])
        return render json: { error: "Order not found" }, status: :not_found unless order

        payment_method = params[:payment_method] || "credit_card"
        
        # Simulate payment processing logic
        payment = order.build_payment(
          payment_method: payment_method,
          amount: order.total_amount,
          status: "success",
          paid_at: Time.current
        )

        if payment.save
          order.update!(status: "paid", payment_status: "paid")
          render json: {
            message: "Payment processed successfully",
            payment: {
              id: payment.id,
              order_id: order.id,
              transaction_id: payment.transaction_id,
              payment_method: payment.payment_method,
              amount: payment.amount,
              status: payment.status,
              paid_at: payment.paid_at
            }
          }, status: :ok
        else
          render json: { errors: payment.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/payments/:id
      def show
        payment = Payment.joins(:order).where(orders: { user_id: current_user.id }).find_by(id: params[:id])
        return render json: { error: "Payment not found" }, status: :not_found unless payment

        render json: payment, status: :ok
      end
    end
  end
end
