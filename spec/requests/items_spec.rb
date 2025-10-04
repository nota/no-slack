require 'rails_helper'

RSpec.describe 'Items', type: :request do
  describe 'POST /items' do
    include_context 'login'

    # let(:item) { Item.find_by(text: 'hello') }

    before do
      post '/items', params: {item: {text: 'hello'}}
    end

    context 'item with current_user' do
      it { expect(Item.where(text: 'hello', user: current_user)).to be_exist }
    end
  end
end
