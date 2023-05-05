const { wlslr } = require('../../util/math')

const getSmoothedProfile = ({ points, locs, gt }) => {
  // locs: array of locations (km)
  // gt: grade smoothing threshold

  const mbs = wlslr(
    points.map(p => { return p.loc }),
    points.map(p => { return p.alt }),
    locs,
    gt
  )
  const ga = []
  locs.forEach((x, i) => {
    let grade = mbs[i][0] / 10
    if (grade > 50) { grade = 50 } else if (grade < -50) { grade = -50 }
    const alt = (x * mbs[i][0]) + mbs[i][1]
    ga.push({
      grade,
      alt
    })
  })
  return ga
}

module.exports = getSmoothedProfile
