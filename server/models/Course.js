var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
  waypoints: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Waypoint' }]
},{
    collection: 'courses'
});

module.exports = mongoose.model('Course', CourseSchema);
