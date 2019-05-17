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
  pacingValue: {
    type: Number
  },
  waypointDelays: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PlanWaypointDelay'
  }]
}, {
  collection: 'plans'
})

module.exports = mongoose.model('Plan', PlanSchema)
