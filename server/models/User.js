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
  altModel: {}
}, {
  collection: 'users'
})

module.exports = mongoose.model('User', UserSchema)
