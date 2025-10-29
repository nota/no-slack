class UsersController < ApplicationController
  def index
    criteria = User.limit(8)

    name = params[:name]&.strip
    if name.present?
      criteria = criteria.where(name: /#{name}/)
    end

    excepts = params[:excepts].map(&:strip)
    if excepts.present?
      criteria = criteria.nin(_id: excepts)
    end

    render json: criteria.to_a
  end
end
