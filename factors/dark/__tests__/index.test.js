import _ from 'lodash'
import { expect, test } from 'vitest'
import dark from '../'

const sun = { nadir: 0, nadirAltitude: -20, sunrise: 21600, sunset: 72000 }
sun.dawn = sun.sunrise - 3600
sun.dusk = sun.sunset + 3600

const model = {
  baseline: 0.025,
  terrainScale: 0.75
}

test('Check dark factor halfway through dawn', () => {
  let fDark = dark({ timeOfDaySeconds: 21600 - 1800, terrainFactor: 1.5, sun, model })
  expect(fDark).toBe(1.2)
})
