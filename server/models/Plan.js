var mongoose = require('mongoose')
var Schema = mongoose.Schema
const Waypoint = require('./Waypoint')

// Define collection and schema for Posts
var PlanSchema = new Schema({
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  pacingMethod: {
    type: String,
    default: 'time'
  },
  pacingValue: {
    type: Number
  }
}, {
  collection: 'plans'
})

module.exports = mongoose.model('Plan', PlanSchema)
