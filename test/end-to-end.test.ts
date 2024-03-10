import _ from 'lodash'
import { expect, test } from 'vitest'

import { Plan } from '../models'
import { course, plan, start } from './data'

type Rules = {
  np?: number
  pace?: number
  elapsed?: number | string
  numChunks?: number
  factor?: number
}

type Test = {
  plan: Plan
  r: Rules & {
    segments?: { index: number; r: Rules }[]
    custom?: { name: string; fun: (p: Plan) => number; result: number }[]
  }
}

const tests: Test[] = [
  {
    plan,
    r: {
      segments: [
        { index: 8, r: { elapsed: 34449 } },
        { index: 16, r: { elapsed: 21 * 3600 + 3 * 60 + 19 } }
      ],
      np: 377.7,
      pace: 468.45,
      elapsed: 79200
    }
  },

  // plan for a 30-hour finish that adjusts only to final cutoff
  {
    plan: new Plan({
      course,
      start,
      name: '30 hour basic',
      method: 'time',
      target: 111600,
      cutoffMargin: 300,
      typicalDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 }
    }),
    r: {
      segments: [
        { index: 8, r: { elapsed: 13 * 3600 + 8 * 60 + 43 } },
        { index: 16, r: { elapsed: 28 * 3600 + 40 * 60 + 40 } }
      ],
      //  np: 539.47,
      pace: 650.2,
      elapsed: 107700
    }
  },

  // plan for a 25-hour with big rests
  {
    plan: new Plan({
      course,
      start,
      name: '25-hr+5hr-delays',
      method: 'time',
      target: 25 * 3600,
      cutoffMargin: 300,
      typicalDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      heatModel: { baseline: 0, max: 5 },
      delays: [
        { waypoint: { site: '5d8e9a27e372020007cb2452', loop: 1 }, delay: 5 * 3600 },
        { waypoint: { site: '5d8e9aaae372020007cb2459', loop: 1 }, delay: 5 * 3600 }
      ]
    }),
    r: {
      segments: [
        { index: 8, r: { elapsed: '11:36:07' } },
        { index: 16, r: { elapsed: '24:21:43' } }
      ],
      elapsed: 25 * 3600
    }
  },

  // plan for a 30-hour finish that adjusts to multiple cutoffs
  {
    plan: new Plan({
      course,
      start,
      name: '30 hour reverse',
      method: 'time',
      target: 111600,
      cutoffMargin: 300,
      typicalDelay: 180,
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
      segments: [
        { index: 8, r: { elapsed: 14 * 3600 + 13 * 60 + 54 } },
        { index: 16, r: { elapsed: 28 * 3600 + 47 * 60 - 0.5 } }
      ],
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
      start,
      name: '10min/mile',
      method: 'pace',
      target: 10 * 60 * 0.621371,
      cutoffMargin: 300,
      typicalDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [
        {
          onset: 0,
          value: -5,
          type: 'linear'
        }
      ],
      heatModel: { baseline: 0, max: 5 }
    }),
    r: {
      segments: [
        { index: 8, r: { elapsed: 8 * 3600 + 16 * 60 + 34 } },
        { index: 16, r: { elapsed: 16 * 3600 + 50 * 60 + 55 } }
      ],
      //  np: 542.63,
      pace: 10 * 60 * 0.621371,
      elapsed: 10 * 60 * 100 + 180 * 17
    }
  },

  // plan for a 20-minute average pace
  {
    plan: new Plan({
      course,
      start,
      name: '20min/mile',
      method: 'pace',
      target: 20 * 60 * 0.621371,
      cutoffMargin: 300,
      typicalDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [
        {
          onset: 0,
          value: -5,
          type: 'linear'
        }
      ],
      heatModel: { baseline: 0, max: 5 }
    }),
    r: {
      segments: [
        { index: 8, r: { elapsed: 14 * 3600 + 6 * 60 + 14.5 } },
        { index: 16, r: { elapsed: 28 * 3600 + 45 * 60 + 18 } }
      ],
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
      start,
      name: '15min-as-cut',
      method: 'pace',
      target: 15 * 60 * 0.621371,
      cutoffMargin: 300,
      typicalDelay: 180,
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
      segments: [
        { index: 8, r: { elapsed: 14 * 3600 + 42 * 60 + 42 } },
        { index: 16, r: { elapsed: 25 * 3600 + 16 * 60 + 59 } }
      ],
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
      start,
      name: '10-min',
      method: 'np',
      target: 10 * 60 * 0.621371,
      cutoffMargin: 300,
      typicalDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 }
    }),
    r: {
      np: 10 * 60 * 0.621371,
      elapsed: '20:52:22',
      custom: [
        {
          name: 'starting pace',
          fun: (p: Plan) =>
            ((p?.points[0]?.pace || 0) / p.points[0].factor) * p.points[0].factors.strategy,
          result: 9 * 60 * 0.621371
        }
      ] // should be 10% under np using default strategy
    }
  },

  // plan for a 13-minute np reverse that hits early cutoffs but finishes before final cutoff
  {
    plan: new Plan({
      course,
      start,
      name: '13-min-rev',
      method: 'np',
      target: 13 * 60 * 0.621371,
      cutoffMargin: 300,
      typicalDelay: 180,
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
      start,
      name: '16-min-rev',
      method: 'np',
      target: 16 * 60 * 0.621371,
      cutoffMargin: 300,
      typicalDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 },
      strategy: [{ onset: 0, value: -100, type: 'linear' }]
    }),
    r: {
      elapsed: 107700
    }
  }
]
function time(v: number | string | undefined) {
  if (_.isString(v)) {
    let x = 0
    v.split(':')
      .reverse()
      .forEach((a, i) => (x += Number(a) * 60 ** i))
    return x
  } else if (_.isNumber(v)) return v
  else throw new Error('ahh')
}

test(`${course.name}: check track distance`, () => {
  expect(course.track.dist).toBeCloseTo(159.32537, 5)
})

test(`${course.name}: check segment 7 properties`, () => {
  expect(course.splits.segments[7].len).toBeCloseTo(5.302885)
  expect(course.splits.segments[7].grade).toBeCloseTo(4.56348)
  expect(course.splits.segments[7].factors.terrain).toBeCloseTo(1.0087442)
})

const pacingTests = ['elapsed', 'factor', 'pace', 'np']

tests.forEach((t) => {
  const str = `${course.name}-${t.plan.method}-${t.plan.name}`

  test(`${str}: Elapsed times`, () => {
    if (_.has(t.r, 'elapsed'))
      expect(_.last(t.plan.splits.segments)?.elapsed).toBeCloseTo(time(t.r.elapsed), 0)
  })

  // if we have specified an elapsed time, also check that time against all the last segments
  if (_.has(t.r, 'elapsed')) {
    if (!t.r.segments) t.r.segments = []
    t.r.segments.push({
      index: t.plan.splits.segments.length - 1,
      r: { elapsed: t.r.elapsed }
    })
  }

  t.r.segments?.forEach(({ index, r }: { index: number; r: Rules }) => {
    pacingTests
      .filter((pt) => _.has(r, pt))
      .forEach((pt) =>
        test(`${str}-${index}: Pacing: ${pt}`, () => {
          const segment = t.plan.splits.segments[index]
          if (!segment) throw new Error('segment doesnt exist')

          if (pt === 'elapsed') expect(segment.elapsed).toBeCloseTo(time(r.elapsed), 0)
          else if (pt === 'pace') expect(segment.pace).toBeCloseTo(time(r.pace), 0)
          else throw new Error('invalid rule')
        })
      )
  })

  test(`${str}: delay adds at right place`, () => {
    const p1 = t.plan.splits.segments[16].point2
    const p2 = t.plan.points.find((p) => p.loc > p1.loc)
    expect(p2 && p2.elapsed - p1.elapsed - (p2.time - p1.time)).toBeCloseTo(t.plan.typicalDelay)
    const p0 = _.findLast(t.plan.points, (p) => p.loc < p1.loc)
    expect(p0 && p2 && p2.elapsed - p0.elapsed - (p2.time - p0.time)).toBeCloseTo(
      t.plan.typicalDelay
    )
  })

  pacingTests
    .filter((pt) => _.has(t.r, pt))
    .forEach((pt) =>
      test(`${str}: Pacing: ${pt}`, () => {
        if (pt === 'elapsed') expect(t.plan.pacing.elapsed).toBeCloseTo(time(t.r.elapsed), 0)
        if (pt === 'factor') expect(t.plan.pacing.factor).toBeCloseTo(time(t.r.factor), 0)
        if (pt === 'pace') expect(t.plan.pacing.pace).toBeCloseTo(time(t.r.pace), 0)
        if (pt === 'np') expect(t.plan.pacing.np).toBeCloseTo(time(t.r.np), 0)
      })
    )

  // custom tests formatted [message,function(plan),result]
  if (t.r.custom) {
    t.r.custom.forEach((c) => {
      test(`${str}: ${c.name}`, () => {
        expect(c.fun(t.plan)).toBeCloseTo(c.result)
      })
    })
  }

  test(`${str}: Calculation success`, () => {
    expect(t.plan.pacing.status.success).toBe(true)
    //expect(t.plan.pacing.chunks.length).toBe(t.r.numChunks || 1)
  })
})
