class Topic
  include Mongoid::Document

  field :title, type: String
  validates :title, presence: true
end
