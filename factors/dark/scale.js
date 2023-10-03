import { interp } from '../../util/math'

export function scale(sun, t) {
  // routine to address tod rollover at midnight
  function offset(t) {
    return t < sun.noon ? t + 86400 : t
  }

  if (t >= sun.sunrise && t <= sun.sunset) {
    return 0
  } else if (!isNaN(sun.dawn) && !isNaN(sun.dusk) && (t <= sun.dawn || t >= sun.dusk)) {
    return 1
  } else {
    // twilight, interpolate
    if (offset(t) >= offset(sun.nadir)) {
      // dawn
      return interp(
        offset(isNaN(sun.dawn) ? sun.nadir : sun.dawn),
        offset(sun.sunrise),
        1,
        0,
        offset(t)
      )
    } else {
      // dusk
      return interp(
        offset(sun.sunset),
        offset(isNaN(sun.dusk) ? sun.nadir : sun.dusk),
        0,
        1,
        offset(t)
      )
    }
  }
}
