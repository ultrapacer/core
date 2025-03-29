import { Types } from '../main'

export function isSourcePoint(arg: Types.LLA | Point): arg is Point {
  return 'source' in arg
}

/**
 * Point object for use as a basis in a track or course
 */
export class Point implements Types.Point {
  get alt(): number {
    return this.source.alt
  }
  set alt(value: number) {
    this.source.alt = value
  }

  get lat(): number {
    return this.source.lat
  }
  set lat(value: number) {
    this.source.lat = value
  }

  get lon(): number {
    return this.source.lon
  }
  set lon(value: number) {
    this.source.lon = value
  }

  source:
    | {
        alt: number
        lat: number
        lon: number
      }
    | Point

  constructor(arg: Point | Types.LLA) {
    this.source = arg
  }
}

/**
 * TrackPoint object for use in a track, with additional data (loc, grade)
 */
export class TrackPoint extends Point implements Types.TrackPoint {
  private _trackData: {
    loc: number
    grade: number
  }
  get grade() {
    return this._trackData.grade
  }
  get loc() {
    return this._trackData.loc
  }

  constructor(arg: Point | Types.LLA, loc: number, grade: number) {
    super(arg)
    this._trackData = { grade, loc }
  }
}
