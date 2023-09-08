/**
 * Return a scaling factor for heat
 *
 * @param {Object}  args          An object.
 * @param {Point}   args.point    Point object per /models/Point
 * @param {Object}  args.model    Heat model in the following format:
 *                                  {
 *                                    start:    tod, seconds
 *                                    stop:     tod, seconds
 *                                    max:      peak % increase in percent
 *                                    baseline: background factor
 *                                  }
 *
 * @return {Number} The heat factor at the provided point
 */
const getHeatFactor = ({ point, model } = {}) => {
  if (!model) return 1

  const t = point.tod
  let f = 1
  if (t > model.start && t < model.stop) {
    const theta = ((t - model.start) / (model.stop - model.start)) * Math.PI
    f += ((model.max - model.baseline) * Math.sin(theta)) / 100
  }
  f += model.baseline / 100
  return f
}

module.exports = getHeatFactor
