module Api
  module V1
    class AuthController < ApplicationController
      # POST /api/v1/auth/signup
      def signup
        user = User.new(user_params)
        user.role = "customer" unless current_user&.admin? # default role customer

        if user.save
          render json: {
            message: "User account created successfully",
            token: user.auth_token,
            user: user
          }, status: :created
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: params[:email])
        if user&.authenticate(params[:password])
          user.generate_auth_token if user.auth_token.blank?
          user.save!
          render json: {
            message: "Login successful",
            token: user.auth_token,
            user: user
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      # DELETE /api/v1/auth/logout
      def logout
        if current_user
          current_user.update!(auth_token: SecureRandom.hex(32)) # invalidate old token
          render json: { message: "Successfully logged out" }, status: :ok
        else
          render json: { error: "No active session" }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/auth/me
      def me
        if current_user
          render json: { user: current_user }, status: :ok
        else
          render json: { user: nil }, status: :ok
        end
      end

      private

      def user_params
        params.require(:user).permit(:name, :email, :password, :password_confirmation, :phone, :address, :role)
      end
    end
  end
end
