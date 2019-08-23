var mongoose = require('mongoose')
var Schema = mongoose.Schema

var UserSchema = new Schema({
  auth0ID: {
    type: String
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
  _courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  collection: 'users'
})

module.exports = mongoose.model('User', UserSchema)
