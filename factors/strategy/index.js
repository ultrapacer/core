const adjust = require('./adjust')

module.exports = function (loc, strategy, length, log = 0) {
  // returns a  strategy factor
  // strategy can be a linear factor
  //  or array of obects
  // loc: point or array [start, end] [km]
  // strategy: in %
  // length: total course length [km]
  if (!strategy) { return 1 }
  let mid
  if (Array.isArray(loc)) {
    mid = (loc[0] + loc[1]) / 2
  } else {
    mid = loc
  }
  if (Array.isArray(strategy)) {
    let a = -adjust(strategy, length)
    strategy.forEach((d, i) => {
      if (mid > d.onset) {
        if (d.type === 'step') {
          a += d.value
        } else if (d.type === 'linear') {
          const end = i === strategy.length - 1 ? length : strategy[i + 1].onset
          if (mid > end) {
            a += d.value
          } else {
            a += d.value * (mid - d.onset) / (end - d.onset)
          }
        }
      }
    })
    return 1 + (a / 100)
  } else {
    const f = ((-strategy / 2) + (mid / length * strategy)) / 100
    return f + 1
  }
}
