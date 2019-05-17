var mongoose = require('mongoose')
var Schema = mongoose.Schema

// Define collection and schema for Posts
var WaypointSchema = new Schema({
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
  terrainIndex: {
    type: Number,
    default: 3
  },
  segmentNotes: {
    type: String
  },
  pointsIndex: {
    type: Number,
    default: 0
  }
}, {
  collection: 'waypoints'
})

module.exports = mongoose.model('Waypoint', WaypointSchema)
