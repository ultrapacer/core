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

const CourseSchema = new Schema({
  schema_version: {
    type: Number,
    default: 1
  },
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
      type: [
        {
          waypoint: {
            site: {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'Waypoint'
            },
            loop: {
              type: Number,
              default: 1
            }
          },
          len: Number,
          _index: Number,
          ...splitFields
        }
      ],
      default: []
    }
  },
  scales: {},
  loops: {
    type: Number,
    default: 1,
    set: v => Math.round(v >= 1 ? v : 1) // ensure integer >= 1
  }
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
  const pnts = course.points

  const loops = this.loops || 1
  const points = await core.tracks.create(
    pnts,
    {
      loops: loops,
      distance: this.distance * loops,
      gain: this.gain * loops,
      loss: this.loss * loops
    }
  )
  this.scales = points.scales

  const wpls = core.waypoints.loopedWaypoints(waypoints, loops, this.distance)

  // get terrrain factors:
  const tFs = core.geo.createTerrainFactors(wpls)

  // add splits:
  const data = { tFs: tFs }
  this.splits.segments = core.geo.createSegments(points, { ...data, waypoints: wpls })
  this.splits.miles = core.geo.createSplits(points, 'miles', data)
  this.splits.kilometers = core.geo.createSplits(points, 'kilometers', data)

  // then update model:
  await this.updateOne({
    scales: this.scales,
    splits: this.splits
  })

  // now replace site objects in segments splits with string:
  this.splits.segments.forEach(s => {
    s.waypoint.site = s.waypoint.site._id
  })
  logger('Course|updateCache', t)
}
CourseSchema.methods.hasCache = function () {
  return Boolean(
    this.scales && this.scales.gain && this.scales.loss &&
    this.splits &&
    this.splits.segments && this.splits.segments.length &&
    this.splits.segments[0].waypoint.loop && // for migration in aug 2021
    this.splits.miles && this.splits.miles.length &&
    this.splits.kilometers && this.splits.kilometers.length
  )
}

CourseSchema.pre('remove', function () {
  Plan.deleteMany({ _course: this._id }).exec()
  Waypoint.deleteMany({ _course: this._id }).exec()
})

module.exports = mongoose.model('Course', CourseSchema)
