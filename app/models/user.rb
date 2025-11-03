class User
  include Mongoid::Document

  field :name, type: String
  validates :name, uniqueness: true, allow_nil: true

  before_create do
    self.name ||= auths.first&.email&.split('@')&.first
  end

  class Auth
    include Mongoid::Document

    field :provider, type: String
    field :uid, type: String
    field :email, type: String

    embedded_in :user
  end

  embeds_many :auths
  index({'auths.provider' => 1, 'auths.uid' => 1}, {unique: true})

  def email
    auths.where(email: {'$exists': true}).pick(:email)
  end

  def as_json(options={})
    super(except: [:auths], methods: [:email])
  end
end
