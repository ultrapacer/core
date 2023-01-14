const _ = require('lodash')
const { rlt, rgt, rgte, req } = require('../util/math')

module.exports = (data, i) => {
  // data is same as data objct in calcPacing
  // i is the iteration number

  // filter out any existing stragegy elements with negative values
  const cutoffs = data.plan.cutoffs.filter(c => rlt(c.loc, data.plan.course.dist, 4))

  const strats = cutoffs.map((c, i) => {
    const prev = data.pacing.strategy.autos
      .filter(s => rlt(s.onset, c.loc, 4))
      .pop() ||
        {
          onset: 0,
          point: data.plan.points[0]
        }

    const next = data.pacing.strategy.autos
      .find(s => rgt(s.onset, c.loc, 4)) ||
        {
          onset: data.plan.course.dist,
          point: _.last(data.plan.points)
        }

    // make sure we have points mapped
    if (!prev.point) prev.point = data.plan.getOrInsertPoint(prev.onset)
    if (!next.point) next.point = data.plan.getOrInsertPoint(next.onset)

    const delay =
      data.plan.delays
        .filter(d =>
          rgte(d.loc, prev.point.loc, 4) &&
          rlt(d.loc, c.loc, 4)
        ).reduce((v, x) => { return v + x.delay }, 0)

    const time = c.point.time - prev.point.time // moving time (no delays)
    const cutoffTime = c.time - prev.point.elapsed - delay // ideal time, no delay

    const overTime = time - cutoffTime

    const a = c.loc - prev.point.loc

    const b = next.point.loc - c.loc

    const scale = overTime / cutoffTime
    const step = (a * scale / b) + scale

    return { onset: c.loc, type: 'step', value: step * 100, point: c.point }
  })

  const steps = strats
    .filter(ss =>
      ss.value > 0 &&
      !data.pacing.strategy.autos.find(s3 => req(s3.onset, ss.onset, 4))
    ).map(s => s.value)
  const max = Math.max(...steps)
  const strat = strats.find(ss => ss.value === max)

  let added = false

  // every fourth iteration, if there is a strategy to add, do so
  if (i === 4 * (data.pacing.strategy.autos.length + 1) && strat) {
    added = true
    data.pacing.strategy.addAuto(strat)
  }

  // refine existing strategies on iterations where a new one isnt added
  if (!added) {
    data.pacing.strategy?.autos?.forEach((s, j) => {
      const strat = strats.find(ss => req(ss.onset, s.onset, 4))
      data.pacing.strategy.adjustAutoValue(s, strat.value)
    })
  }

  return Boolean(
    !added &&
    cutoffs.filter(c => c.point.elapsed - c.time >= 0.5).length === 0
  )
}
