var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Define collection and schema for Posts
var PointsSchema = new Schema({
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  data: [Array]
}, {
  collection: 'points'
})

module.exports = mongoose.model('Points', PointsSchema)
