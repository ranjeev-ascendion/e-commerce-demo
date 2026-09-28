class ApplicationController < ActionController::Base
  protect_from_forgery with: :null_session

  def current_user
    @current_user ||= begin
      auth_header = request.headers["Authorization"]
      if auth_header.present?
        token = auth_header.split(" ").last
        User.find_by(auth_token: token)
      end
    end
  end

  def authenticate_user!
    render json: { error: "Unauthorized access. Please log in." }, status: :unauthorized unless current_user
  end

  def authorize_admin!
    unless current_user&.admin?
      render json: { error: "Forbidden. Admin privileges required." }, status: :forbidden
    end
  end

  def current_cart
    if current_user
      current_user.cart || current_user.create_cart
    else
      session_id = request.headers["X-Session-ID"] || session.id
      Cart.find_or_create_by(session_id: session_id)
    end
  end
end
