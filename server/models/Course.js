var mongoose = require('mongoose')
var Schema = mongoose.Schema
const GPX = require('./GPX')
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
  _gpx: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GPX'
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
  terrainIndex: {
    type: Number,
    default: 3
  },
  gradeAdjustment: {
    type: Number
  },
  waypoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  }],
}, {
  collection: 'courses'
})

CourseSchema.pre('remove', function () {
  GPX.remove({_id: this._gpx}).exec()
  Plan.remove({_course: this._id}).exec()
  Waypoint.remove({_course: this._id}).exec()
  next()
})

module.exports = mongoose.model('Course', CourseSchema)
