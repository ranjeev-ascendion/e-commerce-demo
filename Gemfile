source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby ">= 3.0.0"

# Bundle Rails
gem "rails", "~> 7.1.3"

# Use sqlite3 as the database for Active Record
gem "sqlite3", "~> 1.6"

# Use Puma web server
gem "puma", "~> 6.0"

# Password hashing for authentication
gem "bcrypt", "~> 3.1.7"

# Rack CORS for API requests
gem "rack-cors"

# Build JSON APIs
gem "jbuilder"

# JWT Token Auth
gem "jwt", "~> 2.7"

group :development, :test do
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
  gem "rspec-rails", "~> 6.0"
end

group :development do
  gem "web-console"
end
