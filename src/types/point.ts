import { factors, Types } from '../main'

/**
 * Represents a geographical point with altitude, latitude, longitude, and source information.
 */
export interface Point {
  /**
   * The altitude of the point in meters.
   */
  alt: number

  /**
   * The latitude of the point in decimal degrees.
   */
  lat: number

  /**
   * The longitude of the point in decimal degrees.
   */
  lon: number

  /**
   * The source information of the point, which can be either an object containing altitude, latitude, and longitude, or another Point instance.
   */
  source: Types.LLA | Point
}

export interface TrackPoint extends Point {
  /**
   * The grade of the track at the point in percent.
   */
  grade: number

  /**
   * The location of the point along the track in kilometers.
   */
  loc: number
}

/**
 * CoursePoint object for use in a course, including scaling and loop data
 */
export interface CoursePoint extends TrackPoint {
  /**
   * pacing factors at this point
   */
  factors: factors.Factors

  /**
   * grade, scaled, as a percentage
   */
  grade: number

  /**
   * flag for interpolated points (not part of original course)
   */
  interpolated: boolean

  /**
   * location, scaled, with loop, in kilometers
   */
  loc: number

  /**
   * The loop number of the course point, zero-indexed.
   */
  loop: number

  /**
   * source (parent) point
   */
  source: TrackPoint | CoursePoint
}

/**
 * PlanPoint object for use in a plan, including pacing and time data
 */
export interface PlanPoint extends CoursePoint {
  _chunk?: Types.PaceChunk

  /**
   * delay in seconds at this point (not cumulative)
   */
  delay: number

  /**
   * elapsed time in seconds
   * does not include delay from this point
   */
  elapsed: number

  /**
   * combined pacing factor at this point
   */
  factor: number

  /**
   * normalized pace at this point (from last point) in seconds per kilometer
   */
  np: number

  /**
   * pace at this point (from last point) in seconds per kilometer
   */
  pace: number

  /**
   * moving time in seconds
   */
  time: number

  /**
   * time of day in seconds
   */
  tod: number
}
