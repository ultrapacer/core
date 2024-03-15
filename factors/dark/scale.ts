import { Sun } from '../../models/Sun'
import { interp } from '../../util/math'

/**
 * get scale factor for time of day
 * @param sun - sun model
 * @param ssm - seconds since midnight
 * @returns scale factor
 */
export function scale(sun: Sun, ssm: number) {
  // routine to address tod rollover at midnight
  function offset(ssm: number) {
    return ssm < sun.noon ? ssm + 86400 : ssm
  }

  if (ssm >= sun.sunrise && ssm <= sun.sunset) {
    return 0
  } else if (!isNaN(sun.dawn) && !isNaN(sun.dusk) && (ssm <= sun.dawn || ssm >= sun.dusk)) {
    return 1
  } else {
    // twilight, interpolate
    if (offset(ssm) >= offset(sun.nadir)) {
      // dawn
      return interp(
        offset(isNaN(sun.dawn) ? sun.nadir : sun.dawn),
        offset(sun.sunrise),
        1,
        0,
        offset(ssm)
      )
    } else {
      // dusk
      return interp(
        offset(sun.sunset),
        offset(isNaN(sun.dusk) ? sun.nadir : sun.dusk),
        0,
        1,
        offset(ssm)
      )
    }
  }
}
