import { Types } from '../../main'
import { interp } from '../../util/math'

const twilightAlt = -6 // degrees

/**
 * get scale factor for time of day
 * @param sun - sun model
 * @param ssm - seconds since midnight
 * @returns scale factor
 */
export function scale(sun: Types.SunEvents, ssm: number) {
  if (
    sun.noon.altitude <= twilightAlt || // sun never gets above twilight altitude
    (sun.dawn && ssm < sun.dawn.time) || // before dawn
    (sun.dusk && ssm > sun.dusk.time) // after dusk
  ) {
    // we are in full dark
    return 1
  } else if (
    (sun.sunrise && ssm < sun.sunrise.time) || // before sunrise
    (sun.sunset && ssm > sun.sunset.time) || // after sunset
    (!sun.sunrise && !sun.sunset && sun.noon.altitude < 0) // sun never gets above twilight altitude
  ) {
    // we are in twilight, so we need to interpolate

    // min dark scaling factor if it never gets fully light
    const minDarkScaleFactor = sun.noon.altitude >= 0 ? 0 : sun.noon.altitude / twilightAlt

    // max dark scaling if never gets fully dark
    const maxDarkScaleFactor =
      sun.nadir.altitude < twilightAlt ? 1 : sun.nadir.altitude / twilightAlt

    // routine to address tod rollover at midnight
    function offset(ssm: number) {
      return ssm < sun.noon.time ? ssm + 86400 : ssm
    }

    // twilight, interpolate
    if (offset(ssm) >= offset(sun.nadir.time)) {
      // dawn
      return interp(
        offset(sun.dawn?.time ?? sun.nadir.time),
        offset(sun.sunrise?.time ?? sun.noon.time),
        maxDarkScaleFactor,
        minDarkScaleFactor,
        offset(ssm)
      )
    } else {
      // dusk
      return interp(
        offset(sun.sunset?.time ?? sun.noon.time),
        offset(sun.dusk?.time ?? sun.nadir.time),
        minDarkScaleFactor,
        maxDarkScaleFactor,
        offset(ssm)
      )
    }
  } else {
    // we are in full daylight
    return 0
  }
}
