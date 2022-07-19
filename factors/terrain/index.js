const { rlte } = require('../../util/math')

module.exports = function (loc, tFs) {
  // returns terrain factor at a given location
  // loc: loc [km]
  // tFs: array of terrainFactors [loc, tF] with terrainFactor

  tFs = tFs.filter(x => rlte(x.start, loc, 4))

  if (!tFs.length) return 1
  return (tFs[tFs.length - 1].tF / 100) + 1
}
