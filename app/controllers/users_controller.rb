class UsersController < ApplicationController
  def index
    criteria = User.limit(8)

    case
    when params[:name]
      name = params[:name]&.strip
      if name.present?
        criteria = criteria.where(name: /#{name}/)
      end

      excepts = params[:excepts]&.map(&:strip)
      if excepts.present?
        criteria = criteria.nin(_id: excepts)
      end
    when params[:user_ids]
      begin
        criteria = criteria.in(_id: params[:user_ids].map{|id| BSON::ObjectId(id) })
      rescue BSON::Error::InvalidObjectId
        render json: [], status: :not_found
        return
      end
    end
    render json: criteria.to_a
  end
end
