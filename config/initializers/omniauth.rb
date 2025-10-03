Rails.application.config.middleware.use OmniAuth::Builder do
  google = Rails.application.credentials.google_oauth2
  provider :google_oauth2, google.client_id, google.client_secret
end
OmniAuth.config.allowed_request_methods = %i[post]
