const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  auth0ID: {
    type: String
  },
  email: {
    type: String
  },
  admin: {
    type: Boolean,
    default: false
  },
  distUnits: {
    type: String,
    default: 'mi'
  },
  elevUnits: {
    type: String,
    default: 'ft'
  },
  altModel: {
    type: Object,
    default: null
  },
  membership: {
    type: Object,
    default: null
  },
  last_login: {
    type: Date,
    default: null
  },
  _courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  collection: 'users'
})

module.exports = mongoose.model('User', UserSchema)
