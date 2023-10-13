import { expect, test } from 'vitest'
import { Course } from '../Course'

test('doesnt crash', () => {
  let c = new Course({})
})
