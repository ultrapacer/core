var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PlanSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
  pacingTarget: {
    type: Number
  },
  drift: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Number,
    default: null
  },
  waypointDelay: {
    type: Number,
    default: 60
  },
  waypointDelays: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlanWaypointDelay'
  }]
}, {
  collection: 'plans'
})

module.exports = mongoose.model('Plan', PlanSchema)
