import _ from 'lodash'
import { expect, test } from 'vitest'

import { Plan } from '../models'
import { course, plan } from './data'

const tests = [
  {
    plan,
    r: {
      seg8elapsed: 34449,
      seg16elapsed: 21 * 3600 + 3 * 60 + 19,
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
      seg8elapsed: 13 * 3600 + 8 * 60 + 43,
      seg16elapsed: 28 * 3600 + 40 * 60 + 40,
      //  np: 539.47,
      pace: 650.2,
      elapsed: 107700
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
      seg8elapsed: 14 * 3600 + 13 * 60 + 54,
      seg16elapsed: 28 * 3600 + 47 * 60 - 0.5,
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
      seg8elapsed: 8 * 3600 + 16 * 60 + 34,
      seg16elapsed: 16 * 3600 + 50 * 60 + 55,
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
      seg8elapsed: 14 * 3600 + 6 * 60 + 14.5,
      seg16elapsed: 28 * 3600 + 45 * 60 + 18,
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
      seg8elapsed: 14 * 3600 + 42 * 60 + 42,
      seg16elapsed: 25 * 3600 + 16 * 60 + 59,
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
      name: '10-min-np',
      pacingMethod: 'np',
      pacingTarget: 10 * 60 * 0.621371,
      cutoffMargin: 300,
      waypointDelay: 180,
      scales: { altitude: 1.2, dark: 0.7 }
    }),
    r: {
      np: 10 * 60 * 0.621371
    }
  }
]

test(`${course.name}: check track distance`, () => {
  expect(course.track.dist, 5).toBeCloseTo(159.32537)
})

tests.forEach((t) => {
  test(`${course.name}-${t.plan.name}: Elapsed times`, () => {
    if (_.has(t.r, 'elapsed'))
      expect(_.last(t.plan.splits.segments).elapsed).toBeCloseTo(t.r.elapsed, 0)
    if (_.has(t.r, 'seg16elapsed'))
      expect(t.plan.splits.segments[16].elapsed).toBeCloseTo(t.r.seg16elapsed, 0)
    if (_.has(t.r, 'seg8elapsed'))
      expect(t.plan.splits.segments[8].elapsed).toBeCloseTo(t.r.seg8elapsed, 0)
  })

  test(`${course.name}-${t.plan.name}: delay adds at right place`, () => {
    const p1 = t.plan.splits.segments[16].point2
    const p2 = t.plan.points.find((p) => p.loc > p1.loc)
    expect(p2.elapsed - p1.elapsed - (p2.time - p1.time)).toBeCloseTo(t.plan.waypointDelay)
    const p0 = t.plan.points.findLast((p) => p.loc < p1.loc)
    expect(p2.elapsed - p0.elapsed - (p2.time - p0.time)).toBeCloseTo(t.plan.waypointDelay)
  })

  test(`${course.name}-${t.plan.name}: Check overall paces`, () => {
    if (_.has(t.r, 'pace')) expect(t.plan.pacing.pace, 2).toBeCloseTo(t.r.pace)
    if (_.has(t.r, 'np')) expect(t.plan.pacing.np, 2).toBeCloseTo(t.r.np)
  })

  test(`${course.name}-${t.plan.name}: Calculation success`, () => {
    expect(t.plan.pacing.status.success).toBe(true)
    //expect(t.plan.pacing.chunks.length).toBe(t.r.numChunks || 1)
  })
})
