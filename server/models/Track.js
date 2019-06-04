var mongoose = require('mongoose')
var Schema = mongoose.Schema

var Track = new Schema({
  name: {
    type: String
  },
  points: {
    type: Array
  },
  source: {
    type: String
  }
}, {
  collection: 'track'
})

module.exports = mongoose.model('Track', Track)
