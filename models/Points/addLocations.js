// add locations to array of Point objects
// mutates input array
export const addLocations = (points) => {
  let d = 0
  let l = 0
  points[0].loc = 0
  for (let i = 1, il = points.length; i < il; i++) {
    d = Number(points[i - 1].latlon.distanceTo(points[i].latlon))
    l += d
    points[i].loc = l
  }
}
