
function loopPoints (points, loops) {
  if (loops === 1) return
  const points2 = [...points]
  for (let i = 1; i < loops; i++) {
    points.push(...points2.map(p => { return [...p] }))
  }
}

exports.loopPoints = loopPoints
