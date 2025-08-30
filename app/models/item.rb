class Item
  include Mongoid::Document

  belongs_to :parent, class_name: 'Item', optional: true

  field :text, type: String
  validates :text, presence: true
end
