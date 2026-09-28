require_relative "boot"

require "rails"
# Include each railties manually, if needed
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_view/railtie"
require "action_cable/engine"

Bundler.require(*Rails.groups)

module RailsEcommerceApp
  class Application < Rails::Application
    config.load_defaults 7.1

    # Configuration for the application, engines, and railties goes here.
    config.api_only = false # Allow both HTML frontend and API endpoints

    # CORS configuration
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins "*"
        resource "*",
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head]
      end
    end
  end
end
