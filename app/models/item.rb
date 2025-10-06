class Item
  include Mongoid::Document

  belongs_to :parent, class_name: 'Item', optional: true
  belongs_to :user

  field :order, type: BSON::ObjectId
  before_create do
    order = _id
  end
  before_update do
    order = BSON::ObjectId.new
  end

  field :text, type: String
  validates :text, presence: true

  # field :labels, type: Array

  class Participant
    include Mongoid::Document

    belongs_to :user
    field :role, type: String

    embedded_in :item
  end
  embeds_many :participants

  before_create do
    text.scan(/@(\w+)/).flatten.each do |name|
      user = User.find_by(name:) || User.create!(name:)
      participants.build(user:, role: 'assignee')
    end
    if participants.present?
      participants.build(user:, role: 'requester')
    end
  end

  # as_json
  def count_children
    Item.where(parent: self).count
  end

  def date
    _id.generation_time
  end

  def as_json(options={})
    super(
      {
        include: :user,
        methods: [:count_children, :date]
      }.merge(options)
    )
  end
end
