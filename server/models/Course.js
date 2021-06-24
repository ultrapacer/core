const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Waypoint = require('./Waypoint')
const Plan = require('./Plan')
const core = require('../../core')
const { logger } = require('../../core/logger')

const splitFields = {
  end: Number,
  alt: Number,
  gain: Number,
  loss: Number,
  grade: Number,
  factors: {}
}

// Define collection and schema for Posts
const CourseSchema = new Schema({
  _user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String
  },
  link: {
    type: String,
    unique: true
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
  override: {
    enabled: {
      type: Boolean,
      default: false
    },
    distUnit: {
      type: String
    },
    elevUnit: {
      type: String
    },
    default: {
      enabled: false
    }
  },
  public: {
    type: Boolean,
    default: false
  },
  eventStart: {
    type: Date,
    default: null
  },
  eventTimezone: {
    type: String,
    default: null
  },
  _plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  plans: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  }],
  points: [],
  raw: [],
  reduced: {
    type: Boolean,
    default: true
  },
  source: {},
  altModel: {},
  waypoints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  }],
  splits: {
    miles: {
      type: [splitFields],
      default: []
    },
    kilometers: {
      type: [splitFields],
      default: []
    },
    segments: {
      type: [{
        waypoint: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Waypoint'
        },
        len: Number,
        ...splitFields
      }],
      default: []
    }
  },
  scales: {}
}, {
  collection: 'courses'
})

CourseSchema.methods.addData = async function (user = null, plan = null) {
  // adds waypoints, plans, altitude model, and selected plan to course object
  if (user) {
    [this.waypoints, this.plans] = await Promise.all([
      await Waypoint.find({ _course: this }).sort('location').exec(),
      await Plan.find({ _course: this, _user: user }).sort('name').exec()
    ])
    this.altModel = user.altModel
  } else {
    this.waypoints = await Waypoint.find({ _course: this }).sort('location').exec()
    this.plans = []
    this.altModel = null
  }
  if (plan) {
    this._plan = plan
  } else {
    this._plan = null
  }
}

CourseSchema.methods.clearCache = async function () {
  logger(`Course|clearCache: clearing cache for course ${this._id}`)
  await this.updateOne({ splits: undefined })
}

CourseSchema.methods.updateCache = async function () {
  const t = logger(`Course|updateCache: updating cache for course ${this._id}`)
  const [waypoints, course] = await Promise.all([
    await Waypoint.find({ _course: this }).sort('location').exec(),
    await mongoose.model('Course').findOne({ _id: this._id }).select('points').exec()
  ])
  this.waypoints = waypoints
  const { points, scales } = core.processPoints(
    core.arraysToObjects(course.points),
    this.distance,
    this.gain,
    this.loss
  )
  this.scales = scales

  // get terrrain factors:
  const tFs = core.segments.createTerrainFactors(waypoints)

  // add splits:
  const data = { tFs: tFs }
  this.splits.segments = core.segments.createSegments(points, { ...data, waypoints: waypoints })
  this.splits.miles = core.segments.createSplits(points, 'miles', data)
  this.splits.kilometers = core.segments.createSplits(points, 'kilometers', data)

  // then update model:
  await this.updateOne({
    scales: this.scales,
    splits: this.splits
  })
  logger('Course|updateCache', t)
}

CourseSchema.methods.hasCache = function () {
  return Boolean(
    this.scales && this.scales.gain && this.scales.loss &&
    this.splits &&
    this.splits.segments && this.splits.segments.length &&
    this.splits.miles && this.splits.miles.length &&
    this.splits.kilometers && this.splits.kilometers.length
  )
}

CourseSchema.pre('remove', function () {
  Plan.deleteMany({ _course: this._id }).exec()
  Waypoint.deleteMany({ _course: this._id }).exec()
})

module.exports = mongoose.model('Course', CourseSchema)
