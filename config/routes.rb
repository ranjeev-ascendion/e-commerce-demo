Rails.application.routes.draw do
  # Root route serving frontend SPA
  root "home#index"

  # API Namespace V1
  namespace :api do
    namespace :v1 do
      # 5. User Account (Auth)
      post "auth/signup", to: "auth#signup"
      post "auth/login", to: "auth#login"
      delete "auth/logout", to: "auth#logout"
      get "auth/me", to: "auth#me"

      # 4. Users Management
      resources :users, only: [:index, :show, :update, :destroy]

      # 1. Product CRUD
      resources :products

      # 3. Cart Management
      resource :cart, only: [:show] do
        post "items", to: "carts#add_item"
        put "items/:id", to: "carts#update_item"
        delete "items/:id", to: "carts#remove_item"
        delete "clear", to: "carts#clear"
      end

      # 2. Orders & 7. Order Status
      resources :orders, only: [:index, :show, :create] do
        member do
          patch "status", to: "orders#update_status"
        end
      end

      # 6. Payments
      post "payments/process", to: "payments#process_payment"
      get "payments/:id", to: "payments#show"
    end
  end

  # Fallback for client-side routing
  get "*path", to: "home#index", constraints: ->(req) { !req.xhr? && req.format.html? }
end
