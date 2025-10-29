class ItemsController < ApplicationController
  before_action only: [:index, :create] do
    if params[:item_id]
      @items = Item.where(parent_id: params[:item_id])
    else
      @items = Item.where(parent_id: nil)
    end
  end

  def index
    if params[:actor]
      user_id = User.where(name: params[:actor]).pick(:id)
      @items = @items.where(:participants.elem_match => {actor: true, user_id:})
    elsif params[:waiting]
      user_id = User.where(name: params[:waiting]).pick(:id)
      @items = @items.where(
        :participants.elem_match => {:actor.ne => true, user_id:},
        :participants.elem_match => {actor: true, :user_id.ne => user_id}
      )
    end

    render json: @items.order_by(id: :desc).limit(30).all
  end

  def create
    item = @items.new(params.expect(item: [:text]).merge(user: current_user))
    params[:participants].each do |hash|
      user = User.find_by(id: hash[:user_id])
      if user
        item.participants.build(user:)
      end
    end
    item.save!

    if params[:item_id]
      if params[:done]
        # https://www.mongodb.com/docs/manual/reference/operator/update/positional/
        # TODO: test を追加
        Item.collection.find(_id: BSON::ObjectId(params[:item_id]), 'participants.user_id': current_user.id)
          .update_one('$set': {'participants.$[].actor': false })
      end
      # redirect_to item_path(params[:item_id])
    else
      # redirect_to root_path
    end

    head :created
  end

  def show
    respond_to do |format|
      format.html { render html: '', layout: 'application' }
      format.json { render json: Item.find_by(id: params[:id]).as_json(include: :user) }
    end
  end
end
