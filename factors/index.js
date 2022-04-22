const nF = require('./normFactor.js')
module.exports = {
  normFactor: nF,
  nF: nF,
  gradeFactor: nF.gradeFactor,
  gF: nF.gradeFactor,
  altFactor: nF.altFactor,
  aF: nF.altFactor,
  drift: require('./driftFactor.js'),
  driftFactor: nF.driftFactor,
  dF: nF.driftFactor,
  terrainFactor: nF.terrainFactor,
  tF: nF.terrainFactor,
  heatFactor: nF.heatFactor,
  hF: nF.heatFactor,
  dark: nF.darkFactor,
  defaults: nF.defaults
}
