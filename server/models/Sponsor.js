const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SponsorSchema = new Schema({
  name: {
    type: String
  },
  about: {
    type: String
  },
  logourl: {
    type: String
  },
  href: {
    type: String
  },
  tier: {
    type: Number
  },
  enabled: {
    type: Boolean
  }
}, {
  collection: 'sponsors'
})

module.exports = mongoose.model('Sponsor', SponsorSchema)
