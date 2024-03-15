import { latlon as LatLon } from 'sgeo'

export class Point {
  constructor(lat: number, lon: number, alt: number) {
    this.lat = lat
    this.lon = lon
    this.alt = alt
  }

  alt: number
  lat: number
  lon: number

  get latlon() {
    return new LatLon(this.lat, this.lon)
  }
}

export class TrackPoint extends Point {
  loc: number
  grade: number

  constructor(lat: number, lon: number, alt: number, loc: number, grade: number) {
    super(lat, lon, alt)
    this.loc = loc
    this.grade = grade
  }
}
