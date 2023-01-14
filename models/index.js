const points = require('./points')
const tracks = require('./tracks')

module.exports = {
  Course: require('./Course'),
  Event: require('./Event'),
  Plan: require('./Plan'),
  Point: points.Point,
  Segment: require('./Segment'),
  SuperSegment: require('./SuperSegment'),
  Track: tracks.Track,
  Waypoint: require('./Waypoint')
}

// TODO: rewrite these two modules so this is cleaner:
module.exports.points = points
module.exports.tracks = tracks
