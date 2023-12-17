import { expect, test } from 'vitest'
import { course, plan } from './data'
import { round } from '../util/math'
import { Plan } from '../models'

const tests = [
  {
    plan,
    r: {
      dist: 159.32537,
      seg16elapsed: 75798.7,
      iterations: 4,
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
      cutoffMargin: 450,
      waypointDelay: 180,
      scales: {
        altitude: 1.2,
        dark: 0.7
      }
    }),
    r: {
      dist: 159.32537,
      seg16elapsed: 103096.8,
      iterations: 4,
      np: 539.47,
      pace: 649.27,
      elapsed: 107550
    }
  },

  // plan for a 30-hour finish that adjusts to multiple cutoffs
  {
    plan: new Plan({
      course,
      name: '30 hour reverse',
      pacingMethod: 'time',
      pacingTarget: 111600,
      cutoffMargin: 450,
      waypointDelay: 180,
      scales: {
        altitude: 1.2,
        dark: 0.7
      },
      strategy: [
        {
          onset: 0,
          value: -20,
          type: 'linear'
        }
      ]
    }),
    r: {
      dist: 159.32537,
      seg16elapsed: 103472.5,
      iterations: 4,
      np: 542.63,
      pace: 649.27,
      elapsed: 107550
    }
  }
]

tests.forEach((t) => {
  test(`${course.name}-${t.plan.name}: check track distance`, () => {
    expect(round(course.track.dist, 5)).toBe(t.r.dist)
  })

  test(`${course.name}-${t.plan.name}: Elapsed times`, () => {
    expect(round(t.plan.splits.segments[16].point2.elapsed, 1)).toBe(t.r.seg16elapsed)
    expect(round(t.plan.pacing.elapsed, 2)).toBe(t.r.elapsed)
  })

  test(`${course.name}-${t.plan.name}: Check overall paces`, () => {
    expect(round(t.plan.pacing.np, 2)).toBe(t.r.np)
    expect(round(t.plan.pacing.pace, 2)).toBe(t.r.pace)
  })

  test(`${course.name}-${t.plan.name}: Calculation success`, () => {
    expect(t.plan.pacing.status.success).toBe(true)
  })
})
