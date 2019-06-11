var mongoose = require('mongoose')
var Schema = mongoose.Schema

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
  pacingTarget: {
    type: Number
  },
  time: {
    type: Number
  },
  pace: {
    type: Number
  },
  gnp: {
    type: Number
  },
  drift: {
    type: Number,
    default: 0
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
