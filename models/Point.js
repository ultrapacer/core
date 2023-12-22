import { latlon as LatLon } from 'sgeo'

export class Point {
  constructor(arg) {
    // if arg is length 3, it's lat, lon, alt
    if (arg.length === 3) {
      ;[this.lat, this.lon, this.alt] = arg

      // if arg is length 5, it's loc, lat, lon, at, grade
      // ** NOTE **, this loc and grade are never used
    } else if (arg.length === 5) {
      ;[this.loc, this.lat, this.lon, this.alt, this.grade] = arg

      // otherwise it's wrong
    } else {
      throw new Error('Point data invalid')
    }
  }

  get __class() {
    return 'Point'
  }

  get latlon() {
    return new LatLon(this.lat, this.lon)
  }
}
