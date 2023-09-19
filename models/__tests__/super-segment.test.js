import { expect, test } from 'vitest'
import SuperSegment from '../SuperSegment'
let segments = [{}, {}, {}]

test('Check SuperSegment actualTime', () => {
  let ss = new SuperSegment(segments)
  expect(ss.actualTime).toBe(undefined)
  segments[0].actualTime = 5
  expect(ss.actualTime).toBe(undefined)
  segments[1].actualTime = 10
  segments[2].actualTime = 15
  expect(ss.actualTime).toBe(30)
})
