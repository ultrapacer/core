/* eslint new-cap: 0 */
import { getLatLonAltFromDistance } from './geo'
const sgeo = require('sgeo')

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
    var lla = getLatLonAltFromDistance(points, waypoint.location, waypoint.pointsIndex)
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

function nearestLoc (waypoint, p, th) {
  // iterate to new location based on waypoint lat/lon
  var steps = 5
  var loc = Math.min(p[p.length - 1].loc, waypoint.location)
  var LLA1 = new sgeo.latlon(waypoint.lat, waypoint.lon)
  while (th > 0.025) {
    var size = th / steps
    var locs = []
    for (var i = -steps; i <= steps; i++) {
      var l = loc + (size * i)
      if (l > 0 && l <= p[p.length - 1].loc) {
        locs.push(l)
      }
    }
    var llas = getLatLonAltFromDistance(p, locs)
    llas.forEach(lla => {
      var LLA2 = new sgeo.latlon(lla.lat, lla.lon)
      lla.dist = Number(LLA1.distanceTo(LLA2))
    })
    var min = llas.reduce((min, b) => Math.min(min, b.dist), llas[0].dist)
    var j = llas.findIndex(x => x.dist === min)
    loc = locs[j]
    th = th / steps // downsize iteration
  }
  return loc
}

export default {
  updateLLA: updateLLA,
  sortWaypointsByDistance: sortWaypointsByDistance,
  nearestLoc: nearestLoc
}
