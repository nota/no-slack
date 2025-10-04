class ItemsController < ApplicationController
  def index
    render json: items.order_by(id: :desc).all
  end

  def create
    items.create!(params.expect(item: [:text]).merge(user: current_user))

    if params[:item_id]
      redirect_to item_path(params[:item_id])
    else
      redirect_to root_path
    end
  end

  def show
    respond_to do |format|
      format.html { render html: '', layout: 'application' }
      format.json { render json: Item.find_by(id: params[:id]) }
    end
  end

  private

  def items
    if params[:item_id]
      Item.where(parent_id: params[:item_id])
    else
      Item.where(parent_id: nil)
    end
  end
end
