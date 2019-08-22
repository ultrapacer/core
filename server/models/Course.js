var mongoose = require('mongoose')
var Schema = mongoose.Schema
const Waypoint = require('./Waypoint')
const Plan = require('./Plan')

// Define collection and schema for Posts
var CourseSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  distance: {
    type: Number
  },
  gain: {
    type: Number
  },
  loss: {
    type: Number
  },
  public: {
    type: Boolean,
    default: false
  },
  _plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  plans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  }],
  points: [{}],
  source: {},
  altModel: {},
  gradeAdjustment: {
    type: Number
  },
  waypoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  }]
}, {
  collection: 'courses'
})

CourseSchema.methods.addData = async function (user = null, plan = null) {
  this.waypoints = await Waypoint.find({ _course: this }).sort('location').exec()
  if (user) {
    let q = { _course: this, _user: user }
    this.plans = await Plan.find(q).sort('name').exec()
    this.altModel = user.altModel
  } else {
    this.plans = []
    this.altModel = null
  }
  if (plan) {
    this._plan = plan
  } else {
    this._plan = null
  }
}

CourseSchema.pre('remove', function () {
  Plan.remove({_course: this._id}).exec()
  Waypoint.remove({_course: this._id}).exec()
})

module.exports = mongoose.model('Course', CourseSchema)
