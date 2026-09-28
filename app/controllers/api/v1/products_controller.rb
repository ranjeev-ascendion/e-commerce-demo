module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product, only: [:show, :update, :destroy]
      before_action :authorize_admin!, only: [:create, :update, :destroy]

      # GET /api/v1/products
      def index
        @products = Product.all
        @products = @products.search_by_name(params[:search]) if params[:search].present?
        @products = @products.by_category(params[:category]) if params[:category].present?
        
        render json: @products, status: :ok
      end

      # GET /api/v1/products/:id
      def show
        render json: @product, status: :ok
      end

      # POST /api/v1/products
      def create
        @product = Product.new(product_params)
        if @product.save
          render json: { message: "Product created successfully", product: @product }, status: :created
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PUT/PATCH /api/v1/products/:id
      def update
        if @product.update(product_params)
          render json: { message: "Product updated successfully", product: @product }, status: :ok
        else
          render json: { errors: @product.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # DELETE /api/v1/products/:id
      def destroy
        @product.destroy
        render json: { message: "Product deleted successfully" }, status: :ok
      end

      private

      def set_product
        @product = Product.find_by(id: params[:id])
        render json: { error: "Product not found" }, status: :not_found unless @product
      end

      def product_params
        params.require(:product).permit(:name, :description, :price, :sku, :category, :stock_quantity, :image_url, :active)
      end
    end
  end
end
