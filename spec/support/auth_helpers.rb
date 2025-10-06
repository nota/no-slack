RSpec.shared_context 'login' do
  let(:auth_provider) { 'google_oauth2' }
  let(:auth_uid) { '123' }
  let(:auth_email) { 'adam@example.com' }
  let!(:current_user) { User.create!(name: 'adam',auths: [{provider: auth_provider, uid: auth_uid, email: auth_email}]) }

  let(:auth_env) do
    {
      'omniauth.auth': OmniAuth::AuthHash.new(
        {
          provider: auth_provider,
          uid: auth_uid,
          info: { email: auth_email }
        }
      )
    }
  end

  before do
    get '/auth/google_oauth/callback', env: auth_env
  end
end
