const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Waypoint = require('./Waypoint')
const Plan = require('./Plan')
const core = require('../../core')
const logger = require('winston').child({ file: 'Course.js' })

const splitFields = {
  end: Number,
  alt: Number,
  gain: Number,
  len: Number,
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
    // depreciated 2021.10.22, replaced by _users array
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  _users: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
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
    dist: {
      type: Number
    },
    gain: {
      type: Number
    },
    loss: {
      type: Number
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
  reduced: {
    type: Boolean,
    default: false
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
  },

  // flag for whether course is for an organized race
  race: {
    type: Boolean,
    default: true
  },

  // race cutoff, in seconds from start
  cutoff: {
    type: Number,
    set: v => Math.round(v >= 1 ? v : 1) // ensure integer >= 1
  }
}, {
  collection: 'courses'
})

CourseSchema.virtual('meta.deletable')
  .get(function () { return this.__meta?.deletable })
  .set(function (v) { this.__meta.deletable = v })
CourseSchema.set('toJSON', { virtuals: true })
CourseSchema.set('toObject', { virtuals: true })

CourseSchema.methods.addData = async function (user = null, plan = null) {
  logger.info(`Course addData for ${this._id}`)
  // adds waypoints, plans, altitude model, and selected plan to course object
  if (user) {
    [this.waypoints, this.plans] = await Promise.all([
      await Waypoint.find({ _course: this }).sort('percent location').exec(),
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

  if (!this.loops) this.loops = 1

  // temporary; for legacy waypoints that don't have percent field
  addPercentage(this.waypoints)
}
function addPercentage (sites) {
// temporary; for legacy waypoints that don't have percent field
  const todo = sites.filter(site => site.percent === undefined)
  if (todo.length) {
    logger.info(`Course|addData add percent for ${todo.length} sites`)
    const finish = sites.find(wp => wp.type === 'finish').location
    todo.forEach(site => {
      site.percent = site.location / finish
      site.save()
    })
  }
}
CourseSchema.methods.clearCache = async function () {
  logger.info(`Course|clearCache: clearing cache for course ${this._id}`)
  await this.updateOne({ splits: undefined })
}

CourseSchema.methods.updateCache = async function () {
  logger.info(`Course|updateCache: updating cache for course ${this._id}`)
  const [waypoints, course] = await Promise.all([
    await Waypoint.find({ _course: this }).sort('location').exec(),
    await mongoose.model('Course').findOne({ _id: this._id }).select('points').exec()
  ])

  // temporary; for legacy courses that were reduced
  if (this.reduced || this.override?.enabled) {
    logger.info('Setting override values for reduced track')
    this.override.enabled = true
    if (!this.override.dist) this.override.dist = this.distance
    if (!this.override.gain) this.override.gain = this.gain
    if (!this.override.loss) this.override.loss = this.loss
    if (!this.override.elevUnit) this.override.elevUnit = 'ft'
    if (!this.override.distUnit) this.override.distUnit = 'mi'
    await this.updateOne({ override: this.override, reduced: false })
  }

  addPercentage(waypoints)
  this.waypoints = waypoints
  const loops = this.loops || 1
  const points = await core.tracks.create(course.points, { loops: loops })
  const c = new core.courses.Course(this)
  c.addTrack(points)
  ;({ dist: this.distance, gain: this.gain, loss: this.loss } = c.track)
  await this.updateOne({ distance: this.distance, gain: this.gain, loss: this.loss })

  const wpls = core.waypoints.loopedWaypoints(waypoints, c, loops)
  // get terrrain factors:
  const tFs = core.geo.createTerrainFactors(wpls)

  // add splits:
  const data = { tFs: tFs, course: c }
  this.splits.segments = core.geo.createSegments(c.points, { ...data, waypoints: wpls })
  this.splits.miles = core.geo.createSplits(c.points, 'miles', data)
  this.splits.kilometers = core.geo.createSplits(c.points, 'kilometers', data)

  // then update model:
  await this.updateOne({ splits: this.splits })

  // now replace site objects in segments splits with string:
  this.splits.segments.forEach(s => {
    s.waypoint.site = s.waypoint.site._id
  })
}
CourseSchema.methods.hasCache = function (type) {
  const res = Boolean(
    (!this.override?.enabled || this.override?.dist) && // this is to force fix 10/2/2021
    ((type && type !== 'segments') || (this.splits?.segments?.length && this.splits.segments[0].waypoint.loop)) &&
    ((type && type !== 'miles') || this.splits.miles?.length) &&
    ((type && type !== 'kilometers') || this.splits.kilometers?.length)
  )

  logger.info(`Course|hasCache : ${res}`)
  return res
}

// isPermitted method returns whether the passed permission is allowed
// for the passed user
CourseSchema.methods.isPermitted = function (permission, user) {
  const res = (
    (permission === 'view' && this.public) ||
    user.admin ||
    user.equals(this._user) || // depreciated 2021.10.22
    this._users?.find(u => user.equals(u))
  )
  logger.child({ method: 'isPermitted' }).info(res)
  return res
}

// isDeletable returns whether others are using the course or not
CourseSchema.methods.isDeletable = async function (user) {
  if (this.meta.deletable !== undefined) return this.meta.deletable
  const others = await Plan.countDocuments({
    $and: [
      { _course: this },
      { _user: { $ne: user } }
    ]
  }).exec()
  const result = others === 0
  logger.child({ method: 'isDeletable' }).info(`course ${this._id} is ${result ? '' : 'NOT '}deletable`)
  this.meta.deletable = result
  return result
}

CourseSchema.pre('save', async function (next) {
  // if important fields are changed, clear course cache before saving

  // get list of changed fields
  let changes = this.modifiedPaths()

  // these are the important fields
  const fields = ['override', 'points', 'distance', 'gain', 'loss', 'loops']

  // if any of the changed fields are important, clear the cache
  changes = changes.filter(c => fields.includes(c))
  if (changes.length) {
    logger.child({ method: 'pre-save' }).info(`${changes.join(', ')} changed, clearing cache.`)
    await this.clearCache()
  }

  next()
})

CourseSchema.pre('remove', async function () {
  const log = logger.child({ method: 'pre-remove' })
  const [p, w] = await Promise.all([
    Plan.deleteMany({ _course: this._id }).exec(),
    Waypoint.deleteMany({ _course: this._id }).exec()
  ])
  log.log(p.deletedCount ? 'warn' : 'info', `${p.deletedCount} plans deleted.`)
  log.log(w.deletedCount ? 'warn' : 'info', `${w.deletedCount} waypoints deleted.`)
})

CourseSchema.post('init', async function () {
  const log = logger.child({ method: 'post-init' })
  log.verbose('run')

  // add meta
  this.__meta = {}

  // make sure _users list has _user (now that _user is depreciated)
  if (this._user && this._users) {
    if (!this._users.filter(u => this._user.equals(u)).length) {
      log.verbose('adding _user to _users')
      this._users.push(this._user)
    }
  }
})

module.exports = mongoose.model('Course', CourseSchema)
