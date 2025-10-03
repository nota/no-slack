require 'rails_helper'

RSpec.describe 'Auths', type: :request do
  describe 'GET /auth/:provider/callback' do
    describe 'provider:google_oauth2' do
      let(:provider) { 'google_oauth2' }
      let(:uid) { '123' }
      let!(:user) { nil }
      let(:user_criteria) { User.where('auths.provider': provider, 'auths.uid': uid, 'auths.email': 'adam@example.com') }

      let(:env) do
        {
          'omniauth.auth': OmniAuth::AuthHash.new(
            {
              provider:,
              uid:,
              info: { email: 'adam@example.com' }
            }
          )
        }
      end

      before do
        get '/auth/google_oauth/callback', **{env:}
      end

      shared_examples_for 'login_succeeded' do
        describe 'user' do
          it { expect(user_criteria).to be_exist }
          it { expect(User.count).to eq(1) }
        end

        it { expect(response).to redirect_to(root_path) }
      end

      context 'uid not known' do
        it_behaves_like 'login_succeeded'
      end

      context 'uid exist' do
        let(:user) { User.create!(auths: [{provider:, uid:, email: 'adam@example.com'}]) }

        it_behaves_like 'login_succeeded' do
          context 'session[:user_id]' do
            it { expect(session[:user_id]).to eq(user.id) }
          end
        end
      end
    end
  end
end
