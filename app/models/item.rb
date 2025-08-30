class Item
  include Mongoid::Document

  field :text, type: String
  validates :text, presence: true
end
