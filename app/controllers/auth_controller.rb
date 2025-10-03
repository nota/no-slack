class AuthController < ApplicationController
  def user
    render json: current_user
  end

  def callback
    auth = request.env['omniauth.auth']
    provider = auth['provider']
    uid = auth['uid']
    email = auth.dig('info', 'email')

    user = User.find_by('auths.provider': provider, 'auths.uid': uid) || User.create!(auths: [{provider:, uid:, email:}])
    session[:user_id] = user.id

    redirect_to root_path
  end
end
