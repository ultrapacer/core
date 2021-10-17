const mongoose = require('mongoose')
const Schema = mongoose.Schema

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

module.exports = mongoose.model('Waypoint', WaypointSchema)
