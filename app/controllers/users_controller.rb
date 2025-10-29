class UsersController < ApplicationController
  def index
    criteria = User.limit(8)
    name = params[:name]&.strip
    if name.present?
      criteria = criteria.where(name: /#{name}/)
    end
    render json: criteria.to_a
  end
end
