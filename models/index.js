const points = require('./points.js')
const tracks = require('./tracks.js')

module.exports = {
  Course: require('./Course.js'),
  Event: require('./Event.js'),
  Plan: require('./Plan.js'),
  Point: points.Point,
  Segment: require('./Segment.js'),
  SuperSegment: require('./SuperSegment.js'),
  Track: tracks.Track,
  Waypoint: require('./Waypoint.js')
}

// TODO: rewrite these two modules so this is cleaner:
module.exports.points = points
module.exports.tracks = tracks
