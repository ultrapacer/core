function driftFactor (loc, drift, length, log = 0) {
  // returns a  drift factor
  // drift can be a linear factor
  //  or array of obects
  // loc: point or array [start, end] [km]
  // drift: in %
  // length: total course length [km]
  if (!drift) { return 1 }
  let mid
  if (Array.isArray(loc)) {
    mid = (loc[0] + loc[1]) / 2
  } else {
    mid = loc
  }
  if (Array.isArray(drift)) {
    let a = -adjust(drift, length)
    drift.forEach((d, i) => {
      if (mid > d.onset) {
        if (d.type === 'step') {
          a += d.value
        } else if (d.type === 'linear') {
          const end = i === drift.length - 1 ? length : drift[i + 1].onset
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
    const dF = ((-drift / 2) + (mid / length * drift)) / 100
    return dF + 1
  }
}

function adjust (drift, length) {
  // calculate initial drift factor offset such that drift averages to 0
  let a = 0
  let area = 0
  drift.forEach((d, i) => {
    const end = i === drift.length - 1 ? length : drift[i + 1].onset
    const v = (d.type === 'linear') ? d.value / 2 : d.value
    area += (a + v) * (end - d.onset)
    a += d.value
  })
  return (area / length)
}

module.exports = {
  driftFactor: driftFactor,
  adjust: adjust
}
