const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PlanNote = require('./PlanNote')
const PlanDelay = require('./PlanDelay')

const PlanSchema = new Schema({
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
    type: {},
    default: 0
  },
  startTime: {
    type: Number,
    default: null
  },
  eventStart: {
    type: Date,
    default: null
  },
  eventTimezone: {
    type: String,
    default: null
  },
  heatModel: {
    type: {},
    default: null
  },
  waypointDelay: {
    type: Number,
    default: 60
  },
  waypointDelays: {
    type: [{
      site: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Waypoint'
      },
      loop: {
        type: Number,
        default: 1
      },
      delay: {
        type: Number,
        default: 0
      }
    }],
    default: []
  },
  last_viewed: {
    type: Date,
    default: null
  },
  delays: [PlanDelay.schema],
  notes: [PlanNote.schema]
}, {
  collection: 'plans'
})

module.exports = mongoose.model('Plan', PlanSchema)
