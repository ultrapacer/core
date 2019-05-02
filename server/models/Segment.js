var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define collection and schema for Posts
var SegmentSchema = new Schema({
  name: {
    type: String
  },
  description: {
    type: String
  },
  start: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  },
  end: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Waypoint'
  },
  terrainIndex: {
    type: Number,
    default: 3
  }
},{
    collection: 'segments'
})

module.exports = mongoose.model('Segment', SegmentSchema);
