var mongoose = require('mongoose')
var Schema = mongoose.Schema

var PlanWaypointDelaySchema = new Schema({
  _waypoint: {
    mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  },
  delay: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
  collection: 'plan-waypoint-delays'
})

module.exports = mongoose.model('PlanWaypointDelay', PlanWaypointDelaySchema)
