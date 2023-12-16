import { expect, test } from 'vitest'
import { course, plan } from './data'
import { course as course2, plan as plan2 } from './data2'
import { round } from '../util/math'

test('RDL: check track distance', () => {
  expect(round(course.track.dist, 5)).toBe(159.32537)
})

test('RDL: Elapsed time at the end of segment 16', () => {
  expect(round(plan.splits.segments[16].point2.elapsed, 1)).toBe(75798.7)
})

test('RDL: Check overall paces', () => {
  expect(plan.pacing.status.success).toBe(true)
  expect(plan.pacing.status.iterations).toBe(4)
  expect(round(plan.pacing.np, 2)).toBe(377.7)
  expect(round(plan.pacing.pace, 2)).toBe(468.45)
})

test('200: check track distance', () => {
  expect(round(course2.track.dist, 5)).toBe(325.91974)
})

test('200: Elapsed time at the end of segment 16', () => {
  expect(round(plan2.splits.segments[16].point2.elapsed, 1)).toBe(75798.7)
})

test('200: Check overall paces', () => {
  expect(plan2.pacing.status.success).toBe(true)
  expect(plan2.pacing.status.iterations).toBe(4)
  expect(round(plan2.pacing.np, 2)).toBe(377.7)
  expect(round(plan2.pacing.pace, 2)).toBe(468.45)
})
