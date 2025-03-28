import { Types } from '../main'
import type { Course } from './course'

/**
 * Waypoint cutoff object
 */
type WaypointCutoff = { loop: number; time: number }

/**
 * Site data object
 */
export interface SiteData {
  /**
   * optional cutoffs for the site
   */
  cutoffs?: WaypointCutoff[]

  /**
   * optional description for the site
   */
  description?: string

  /**
   * hasDelay - true if the site has a delay
   */
  hasDelay?: boolean

  /**
   * optional id for the site
   * required when inputting plan delays
   */
  id?: string | symbol

  /**
   * isFinish - true if the site is the finish of the course
   */
  isFinish?: boolean

  /**
   * isStart - true if the site is the start of the course
   */
  isStart?: boolean

  /**
   * optional name for the site
   */
  name?: string | undefined

  /**
   * percent of total distance along the track where the site is located
   */
  percent: number
}

/**
 * Site object
 */
export interface Site {
  /**
   * altitude of the site
   */
  readonly alt: number

  /**
   * course the site is associated with
   */
  readonly course: Course

  /**
   * optional cutoffs for the site
   */
  readonly cutoffs: WaypointCutoff[]

  /**
   * optional description for the site
   */
  readonly description?: string | undefined

  /**
   * hasDelay - true if the site has a delay
   */
  readonly hasDelay?: boolean | undefined

  /**
   * optional id for the site
   */
  readonly id?: string | symbol | undefined

  /**
   * isFinish - true if the site is the finish of the course
   */
  readonly isFinish?: boolean | undefined

  /**
   * isStart - true if the site is the start of the course
   */
  readonly isStart?: boolean | undefined

  /**
   * latitude of the site
   */
  readonly lat: number

  /**
   * longitude of the site
   */
  readonly lon: number

  /**
   * optional name for the site
   */
  readonly name?: string | undefined

  /**
   * percent of total distance along the track where the site is located
   */
  readonly percent: number

  /**
   * waypoints associated with the site
   */
  readonly waypoints: Types.Waypoint[]

  /**
   * refresh the latitude, longitude, and altitude of the site
   */
  refreshLLA(): void
}
