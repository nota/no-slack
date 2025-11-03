require 'rails_helper'

RSpec.describe 'Items', type: :request do
  describe 'GET /items.json' do
    context '?assignee=adam' do
      let!(:adam) { User.create!(name: 'adam') }
      let!(:bob) { User.create!(name: 'bob') }
      let!(:adam_item) { Item.create!(text: 'nope', user: adam) }
      let!(:bob_hey_adam_item) { Item.create!(text: 'Hey @adam', user: bob) }
      let!(:adam_hello_bob_item) { Item.create!(text: 'Hello @bob', user: adam) }

      before do
        get '/items.json', params: { assignee: 'adam' }
      end

      subject { response.parsed_body }

      describe 'count' do
        it { expect(subject.size).to eq(1) }
      end

      describe 'the item.text' do
        it { expect(subject.first[:text]).to eq(bob_hey_adam_item.text) }
      end
    end
  end

  describe 'POST /items' do
    include_context 'login'

    let!(:parent) { nil }
    let(:params) { { item: { text: 'hello' } } }
    let(:path) { '/items' }

    before do
      post path, params:
    end

    shared_examples_for 'created item' do
      let(:criteria) { Item.where(text: 'hello', user: current_user) }

      describe 'with current_user' do
        it { expect(criteria).to be_exist }
      end
    end

    context 'root item' do
      it_behaves_like 'created item' do
        describe 'parent_id' do
          it { expect(criteria.first.parent_id).to be_nil  }
        end
      end

      it { expect(response).to redirect_to('/') }
    end

    context 'with parent item' do
      let!(:parent) { Item.create!(user: User.create!, text: 'parent') }
      let(:path) { "/items/#{parent.id}/items" }

      it_behaves_like 'created item' do
        it { expect(Item.where(parent:)).to be_exist }
      end

      it { expect(response).to redirect_to("/items/#{parent.id}") }
    end

    context 'with mention' do
      # let!(:bob) { User.all.to_a;User.create!(name: 'bob') }

      let(:params) { { item: { text: '@bob, give me a favor.' } } }

      describe 'participants' do
        describe 'assignee' do
          it { expect(Item.first.participants.find_by(role: 'assignee').user).to eq(User.find_by(name: 'bob')) }
        end

        describe 'requester' do
          it { expect(Item.first.participants.find_by(role: 'requester').user).to eq(current_user) }
        end
      end
    end
  end

  describe 'PATCH /items/:id' do
    let(:user) { User.create! }
    let!(:item) { Item.create!(text: 'nope', user:, participants: [{user:, actor: true}]) }
    let(:participant_id) { item.participants.first.id }

    before do
      patch "/items/#{item.id}", params: { item: {participants_attributes: [{ _id: participant_id, actor: false }]}}
    end

    it { expect(response).to have_http_status(:ok) }
    it { expect(item.reload.participants.find_by(_id: participant_id).actor).to eq(false) }
  end
end
