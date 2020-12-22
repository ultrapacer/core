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
  segmentNotes: {
    type: String
  },
  pointsIndex: {
    type: Number,
    default: 0
  },
  tier: {
    type: Number,
    default: 1
  }
}, {
  collection: 'waypoints'
})

module.exports = mongoose.model('Waypoint', WaypointSchema)
