module.exports = function (time, model = null) {
  // returns heat factor
  // time is time of day in milliseconds
  // model format:
  //    start:    tod, seconds
  //    stop:     tod, seconds
  //    max:      peak % increase in percent
  //    baseline: background factor
  if (model === null) {
    return 1
  }
  let t = 0
  if (Array.isArray(time)) {
    t = (time[0] + time[1]) / 2
  } else {
    t = time
  }
  let f = 1
  if (t > model.start && t < model.stop) {
    const theta = (t - model.start) / (model.stop - model.start) * Math.PI
    f += ((model.max - model.baseline) * Math.sin(theta)) / 100
  }
  f += model.baseline / 100
  return f
}
