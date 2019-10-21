var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PointsSchema = new Schema({
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  type: {
    type: String,
    default: 'raw'
  },
  data: [],
}, {
  collection: 'points'
})

module.exports = mongoose.model('Points', PointsSchema)
