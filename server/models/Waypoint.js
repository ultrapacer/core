const mongoose = require('mongoose')
const Schema = mongoose.Schema
const logger = require('winston').child({ file: 'Waypoint.js' })

// Define collection and schema for Posts
const WaypointSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  _course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  location: {
    // location field is becoming obsolete; being replaced w/ percent
    type: Number
  },
  lat: {
    type: Number
  },
  lon: {
    type: Number
  },
  elevation: {
    type: Number
  },
  type: {
    type: String,
    default: 'aid'
  },
  terrainFactor: {
    type: Number,
    default: null
  },
  terrainType: {
    type: String,
    default: null
  },
  pointsIndex: {
    type: Number,
    default: 0
  },
  tier: {
    type: Number,
    default: 1
  },
  percent: {
    type: Number
  },

  // array of cutoff times and loops
  cutoffs: {
    type: [
      {
        time: {
          type: Number,
          set: v => Math.round(v >= 1 ? v : 1) // ensure integer >= 1
        },
        loop: {
          type: Number,
          set: v => Math.round(v >= 1 ? v : 1) // ensure integer >= 1
        }
      }
    ]
  }
}, {
  collection: 'waypoints'
})

WaypointSchema.pre('save', async function (next) {
  // if important fields are changed, clear course cache

  // get list of changed fields
  let changes = this.modifiedPaths()

  // these are the important fields
  const fields = ['percent', 'terrainFactor', 'tier']

  // if any of the changed fields are important, clear the cache
  changes = changes.filter(c => fields.includes(c))
  if (changes.length) {
    logger.child({ method: 'pre-save' }).info(`${changes.join(', ')} changed; clearing cache.`)
    await this._course?.clearCache?.()
  }

  next()
})

WaypointSchema.post('remove', function () {
  logger.child({ method: 'post-remove' }).info('run')
  this._course?.clearCache?.()
})

module.exports = mongoose.model('Waypoint', WaypointSchema)
