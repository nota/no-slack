class ItemsController < ApplicationController
  def index
    render json: items.order_by(id: :desc).all
  end

  def create
    items.create!(params.expect(item: [:text]))
    redirect_to root_path
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
