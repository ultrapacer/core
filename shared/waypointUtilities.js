const util = require('./utilities')

function updateLLA (waypoint, points) {
  if (waypoint.type === 'start') {
    waypoint.elevation = points[0].alt
    waypoint.lat = points[0].lat
    waypoint.lon = points[0].lon
  } else if (waypoint.type === 'finish') {
    waypoint.elevation = points[points.length - 1].alt
    waypoint.lat = points[points.length - 1].lat
    waypoint.lon = points[points.length - 1].lon
  } else {
    var lla = util.getLatLonAltFromDistance(points, waypoint.location, waypoint.pointsIndex)
    waypoint.lat = lla.lat
    waypoint.lon = lla.lon
    waypoint.elevation = lla.alt
    waypoint.pointsIndex = lla.ind
  }
}

function compareWaypointsForSort (a, b) {
  let comparison = 0
  if (a.location > b.location) {
    comparison = 1
  } else if (a.location < b.location) {
    comparison = -1
  }
  return comparison
}

function sortWaypointsByDistance (waypoints) {
  waypoints.sort(compareWaypointsForSort)
}

module.exports = {
  updateLLA: updateLLA,
  sortWaypointsByDistance: sortWaypointsByDistance
}
