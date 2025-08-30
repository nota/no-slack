class ItemsController < ApplicationController
  def index
    @items = Item.all
    render json: @items
  end

  def create
    Item.create!(params.expect(item: [:text]))
    redirect_to root_path
  end
end
