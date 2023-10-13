import _ from 'lodash'
import { expect, test } from 'vitest'
import { course, plan } from './data'
import { round } from '../util/math'

test('check track distance', () => {
  expect(round(course.track.dist, 5)).toBe(159.32537)
})

test('Elapsed time at the end of segment 16', () => {
  expect(round(plan.splits.segments[16].point2.elapsed, 1)).toBe(75798.7)
})

test('Check overall paces', () => {
  expect(round(plan.pacing.np, 2)).toBe(377.7)
  expect(round(plan.pacing.pace, 2)).toBe(468.45)
})
