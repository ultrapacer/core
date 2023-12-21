import { expect, test } from 'vitest'

import { Course } from '../Course'

test('doesnt crash', () => {
  const c = new Course({})
  expect(typeof c).toBe('object')
})
