module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!
      before_action :authorize_admin!, only: [:index, :destroy]

      # GET /api/v1/users
      def index
        users = User.all
        render json: users, status: :ok
      end

      # GET /api/v1/users/:id
      def show
        user = (current_user.admin? ? User.find_by(id: params[:id]) : current_user)
        return render json: { error: "User not found" }, status: :not_found unless user

        render json: user, status: :ok
      end

      # PUT/PATCH /api/v1/users/:id
      def update
        user = (current_user.admin? ? User.find_by(id: params[:id]) : current_user)
        return render json: { error: "User not found" }, status: :not_found unless user

        if user.update(user_update_params)
          render json: { message: "User profile updated successfully", user: user }, status: :ok
        else
          render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/users/:id
      def destroy
        user = User.find_by(id: params[:id])
        return render json: { error: "User not found" }, status: :not_found unless user

        user.destroy
        render json: { message: "User account deleted" }, status: :ok
      end

      private

      def user_update_params
        params.require(:user).permit(:name, :email, :phone, :address)
      end
    end
  end
end
