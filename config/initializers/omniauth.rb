Rails.application.config.middleware.use OmniAuth::Builder do
  google = Rails.application.credentials.google_oauth2
  if google
    provider :google_oauth2, google.client_id, google.client_secret
  else
    provider :google_oauth2, ENV['GOOGLE_CLIENT_ID'], ENV['GOOGLE_CLIENT_SECRET']
  end
end
OmniAuth.config.allowed_request_methods = %i[post]
