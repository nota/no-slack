class ItemsController < ApplicationController
  before_action only: [:index, :create] do
    if params[:item_id]
      @items = Item.where(parent_id: params[:item_id])
    else
      @items = Item.where(parent_id: nil)
    end
  end

  def index
    if params[:assignee]
      user_id = User.where(name: params[:assignee]).pick(:id)
      @items = @items.where(:participants.elem_match => {role: 'assignee', user_id:})
    end

    render json: @items.order_by(id: :desc).limit(30).all
  end

  def create
    @items.create!(params.expect(item: [:text]).merge(user: current_user))

    if params[:item_id]
      redirect_to item_path(params[:item_id])
    else
      redirect_to root_path
    end
  end

  def show
    respond_to do |format|
      format.html { render html: '', layout: 'application' }
      format.json { render json: Item.find_by(id: params[:id]).as_json(include: :user) }
    end
  end
end
