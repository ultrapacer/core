import _ from 'lodash'
import { expect, test } from 'vitest'

import { Plan } from '../models'
import { course, plan } from './data'

const tests = [
  {
    plan,
    r: {
      segments: {
        8: { elapsed: 34449 },
        16: { elapsed: 21 * 3600 + 3 * 60 + 19 }
      },
      np: 377.7,
      pace: 468.45,
      elapsed: 79200
    }
  },

  // plan for a 30-hour finish that adjusts only to final cutoff
  {
    plan: new Plan({
      course,
      name: '30 hour basic',
      pacingMethod: 'time',
      pacingTarget: 111600,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 }
    }),
    r: {
      segments: {
        8: { elapsed: 13 * 3600 + 8 * 60 + 43 },
        16: { elapsed: 28 * 3600 + 40 * 60 + 40 }
      },
      //  np: 539.47,
      pace: 650.2,
      elapsed: 107700
    }
  },

  // plan for a 25-hour with big rests
  {
    plan: new Plan({
      course,
      name: '25-hr+5hr-delays',
      pacingMethod: 'time',
      pacingTarget: 25 * 3600,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      heatModel: { start: 29319, stop: 72036, baseline: 0, max: 5 },
      delays: [
        { waypoint: { site: '5d8e9a27e372020007cb2452', loop: 1 }, delay: 5 * 3600 },
        { waypoint: { site: '5d8e9aaae372020007cb2459', loop: 1 }, delay: 5 * 3600 }
      ]
    }),
    r: {
      segments: { 8: { elapsed: '11:36:07' }, 16: { elapsed: '24:21:43' } },
      elapsed: 25 * 3600
    }
  },

  // plan for a 30-hour finish that adjusts to multiple cutoffs
  {
    plan: new Plan({
      course,
      name: '30 hour reverse',
      pacingMethod: 'time',
      pacingTarget: 111600,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [
        {
          onset: 0,
          value: -20,
          type: 'linear'
        }
      ]
    }),
    r: {
      segments: {
        8: { elapsed: 14 * 3600 + 13 * 60 + 54 },
        16: { elapsed: 28 * 3600 + 47 * 60 - 0.5 }
      },
      //    np: 542.63,
      pace: 650.2,
      elapsed: 107700,
      numChunks: 4
    }
  },

  // plan for a 10-minute average pace
  {
    plan: new Plan({
      course,
      name: '10min/mile',
      pacingMethod: 'pace',
      pacingTarget: 10 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [
        {
          onset: 0,
          value: -5,
          type: 'linear'
        }
      ],
      heatModel: { start: 29319, stop: 72036, baseline: 0, max: 5 }
    }),
    r: {
      segments: {
        8: { elapsed: 8 * 3600 + 16 * 60 + 34 },
        16: { elapsed: 16 * 3600 + 50 * 60 + 55 }
      },
      //  np: 542.63,
      pace: 10 * 60 * 0.621371,
      elapsed: 10 * 60 * 100 + 180 * 17
    }
  },

  // plan for a 20-minute average pace
  {
    plan: new Plan({
      course,
      name: '20min/mile',
      pacingMethod: 'pace',
      pacingTarget: 20 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [
        {
          onset: 0,
          value: -5,
          type: 'linear'
        }
      ],
      heatModel: { start: 29319, stop: 72036, baseline: 0, max: 5 }
    }),
    r: {
      segments: {
        8: { elapsed: 14 * 3600 + 6 * 60 + 14.5 },
        16: { elapsed: 28 * 3600 + 45 * 60 + 18 }
      },
      //   np: 542.63,
      pace: (107700 - 180 * 17) / (100 / 0.621371),
      elapsed: 107700, // cutoff,
      numChunks: 2
    }
  },

  // plan for a 15-minute average pace missing early cutoff
  {
    plan: new Plan({
      course,
      name: '15min-as-cut',
      pacingMethod: 'pace',
      pacingTarget: 15 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [
        {
          onset: 0,
          value: -100,
          type: 'linear'
        }
      ]
    }),
    r: {
      segments: {
        8: { elapsed: 14 * 3600 + 42 * 60 + 42 },
        16: { elapsed: 25 * 3600 + 16 * 60 + 59 }
      },
      // np: 542.63,
      pace: 15 * 60 * 0.621371,
      elapsed: 15 * 60 * 100 + 17 * 180, // cutoff,
      numChunks: 3
    }
  },

  // plan for a 10-minute np
  {
    plan: new Plan({
      course,
      name: '10-min',
      pacingMethod: 'np',
      pacingTarget: 10 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 }
    }),
    r: {
      np: 10 * 60 * 0.621371,
      elapsed: '20:52:22',
      custom: [
        [
          'starting pace',
          (p) => (p.points[0].pace / p.points[0].factor) * p.points[0].factors.strategy,
          9 * 60 * 0.621371
        ]
      ] // should be 10% under np using default strategy
    }
  },

  // plan for a 13-minute np reverse that hits early cutoffs but finishes before final cutoff
  {
    plan: new Plan({
      course,
      name: '13-min-rev',
      pacingMethod: 'np',
      pacingTarget: 13 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [{ onset: 0, value: -100, type: 'linear' }]
    }),
    r: {
      np: 13 * 60 * 0.621371
    }
  },

  // plan for a 15-minute np reverse that needs to get reduced to final cutoff
  {
    plan: new Plan({
      course,
      name: '16-min-rev',
      pacingMethod: 'np',
      pacingTarget: 16 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [{ onset: 0, value: -100, type: 'linear' }]
    }),
    r: {
      elapsed: 107700
    }
  }
]
function time(v) {
  if (_.isString(v)) {
    let x = 0
    v.split(':')
      .reverse()
      .forEach((a, i) => (x += Number(a) * 60 ** i))
    return x
  }
  return v
}

test(`${course.name}: check track distance`, () => {
  expect(course.track.dist, 5).toBeCloseTo(159.32537)
})

const pacingTests = ['elapsed', 'factor', 'pace', 'np', 'time']

tests.forEach((t) => {
  const str = `${course.name}-${t.plan.pacingMethod}-${t.plan.name}`

  test(`${str}: Elapsed times`, () => {
    if (_.has(t.r, 'elapsed'))
      expect(_.last(t.plan.splits.segments).elapsed).toBeCloseTo(time(t.r.elapsed), 0)
  })

  // if we have specified an elapsed time, also check that time against all the last segments
  if (_.has(t.r, 'elapsed')) {
    if (!t.r.segments) t.r.segments = {}
    _.assign(
      t.r.segments,
      _.fromPairs([[t.plan.splits.segments.length - 1, { elapsed: t.r.elapsed }]])
    )
  }

  if (t.r.segments)
    _.forOwn(t.r.segments, (o, i) => {
      pacingTests
        .filter((pt) => _.has(o, pt))
        .forEach((pt) =>
          test(`${str}-${i}: Pacing: ${pt}`, () => {
            expect(t.plan.splits.segments[i][pt], 2).toBeCloseTo(time(o[pt]), 0)
          })
        )
    })

  test(`${str}: delay adds at right place`, () => {
    const p1 = t.plan.splits.segments[16].point2
    const p2 = t.plan.points.find((p) => p.loc > p1.loc)
    expect(p2.elapsed - p1.elapsed - (p2.time - p1.time)).toBeCloseTo(t.plan.waypointDelay)
    const p0 = t.plan.points.findLast((p) => p.loc < p1.loc)
    expect(p2.elapsed - p0.elapsed - (p2.time - p0.time)).toBeCloseTo(t.plan.waypointDelay)
  })

  pacingTests
    .filter((pt) => _.has(t.r, pt))
    .forEach((pt) =>
      test(`${str}: Pacing: ${pt}`, () => {
        expect(t.plan.pacing[pt]).toBeCloseTo(time(t.r[pt]), 0)
      })
    )

  // custom tests formatted [message,function(plan),result]
  if (t.r.custom) {
    t.r.custom.forEach((c) => {
      test(`${str}: ${c[0]}`, () => {
        expect(c[1](t.plan)).toBeCloseTo(c[2])
      })
    })
  }

  test(`${str}: Calculation success`, () => {
    expect(t.plan.pacing.status.success).toBe(true)
    //expect(t.plan.pacing.chunks.length).toBe(t.r.numChunks || 1)
  })
})
