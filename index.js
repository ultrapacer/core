const factors = require('./factors')
const models = require('./models')
module.exports = {
  factors: factors,
  f: factors,
  normFactor: factors.normFactor,
  nF: factors.normFactor,
  models: models,
  m: models,
  geo: require('./geo.js'),
  events: models.events,
  segments: models.segments,
  points: models.points,
  tracks: models.tracks,
  waypoints: models.waypoints,
  courses: models.courses,
  plans: models.plans,
  util: require('./util.js'),
  math: require('./util/math.js')
}
