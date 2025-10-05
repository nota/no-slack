class Item
  include Mongoid::Document

  belongs_to :parent, class_name: 'Item', optional: true
  belongs_to :user

  field :text, type: String
  validates :text, presence: true

  field :labels, type: Array

  def count_children
    Item.where(parent: self).count
  end
end
