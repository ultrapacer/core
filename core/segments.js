const { calcSegments } = require('./geo')

function addTOD (segments, points, startTime = null) {
  if (startTime !== null && points[0].elapsed !== undefined) {
    segments.forEach((x) => {
      x.tod = (x.elapsed + startTime) % 86400
    })
  }
}

function createTerrainFactors (waypoints) {
  if (!waypoints.length) { return [] }
  let tF = waypoints[0].terrainFactor
  const tFs = waypoints.filter((x, i) => i < waypoints.length - 1).map((x, i) => {
    if (x.terrainFactor !== null) { tF = x.terrainFactor }
    return {
      start: x.location,
      end: waypoints[i + 1].location,
      tF: tF
    }
  })
  return tFs
}

function createSegments (points, data = null) {
  // break on non-hidden waypoints:
  const wps = data.waypoints.filter(x => x.tier < 3)

  // get array of location breaks:
  const breaks = wps.map(x => { return x.location })

  // determine all the stuff
  const segments = calcSegments(points, breaks, data)

  // map in waypoints:
  segments.forEach((x, i) => { x.waypoint = wps[i + 1] })

  // map in time:
  addTOD(segments, points, data.startTime)

  return segments
}

function createSplits (points, units, data = null) {
  const distScale = (units === 'kilometers') ? 1 : 0.621371
  const tot = points[points.length - 1].loc * distScale
  const breaks = [0]
  let i = 1
  while (i < tot) {
    breaks.push(i / distScale)
    i++
  }
  if (tot / distScale > breaks[breaks.length - 1]) {
    breaks.push(tot / distScale)
  }

  // remove last break if it's negligible
  if (
    breaks.length > 1 &&
    breaks[breaks.length - 1] - breaks[breaks.length - 2] < 0.0001
  ) {
    breaks.pop()
  }

  // get the stuff
  const splits = calcSegments(points, breaks, data)

  // map in time:
  addTOD(splits, points, data.startTime)

  return splits
}

exports.createSegments = createSegments
exports.createSplits = createSplits
exports.createTerrainFactors = createTerrainFactors
