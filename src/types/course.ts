import { type Types } from '..'

export type TerrainTypeIndex = 'paved' | 'dirt road' | 'doubletrack' | 'singletrack' | 'technical'

export interface TerrainElement {
  /**
   * Terrain value, not factor (eg, this is a number, eg 5, not a factor like 1.05)
   */
  value: number

  /**
   * Terrain type, if applicable
   */
  type?: string | undefined

  /**
   * Percent range of terrain
   */
  percents: [number, number]
}

/**
 * Course data
 */
export type CourseData = {
  /**
   * Number of loops
   */
  loops?: number | undefined

  /**
   * Specified (override) distance of course (in km)
   */
  dist?: number | undefined

  /**
   * Specified (override) gain of course (in meters)
   */
  gain?: number | undefined

  /**
   * Specified (override) loss of course (in meters)
   */
  loss?: number | undefined

  /**
   * List of sites along course to create waypoints
   */
  sites?: Types.SiteData[] | undefined

  /**
   * Terrain data
   */
  terrain?:
    | {
        percent: number
        value: number | TerrainTypeIndex | { value: number; type?: string }
      }[]
    | undefined
}

/**
 * Course update data
 */
export type CourseUpdateData = Partial<CourseData>

export interface CourseCutoff {
  waypoint: Types.Waypoint

  loc: number

  time: number
}

type Stat = { avg: number; max: number; min: number }

/**
 * Course stats data
 */
export interface CourseStats {
  /**
   * course altitude stats
   */
  altitude: Stat

  /**
   * course grade stats
   */
  grade: Stat

  /**
   * course terrain stats
   */
  terrain: Stat & { maxDist: number; minDist: number }
}

export interface Course {
  /**
   * Course cutoffs
   */
  readonly cutoffs?: CourseCutoff[]

  /**
   * Total distance of course (in km)
   */
  readonly dist: number

  /**
   * Distance scale of course, relative to calculated track distance, as a factor (eg, 1.05)
   */
  readonly distScale: number

  /**
   * Total gain of course (in meters)
   */
  readonly gain: number

  /**
   * Gain scale of course, relative to calculated track gain, as a factor (eg, 1.05)
   */
  readonly gainScale: number

  /**
   * Distance of each loop (in km)
   */
  readonly loopDist: number

  /**
   * Gain of each loop (in meters)
   */
  readonly loopGain: number

  /**
   * Loss of each loop (in meters)
   */
  readonly loopLoss: number

  /**
   * Number of loops for the track
   */
  readonly loops: number

  /**
   * Total loss of course (in meters)
   */
  readonly loss: number

  /**
   * Loss scale of course, relative to calculated track loss, as a factor (eg, 1.05)
   */
  readonly lossScale: number

  /**
   * Course points
   */
  readonly points: Types.CoursePoint[]

  /**
   * Course sites
   */
  readonly sites: Types.Site[]

  /**
   * Course splits
   */
  readonly splits: Types.CourseSplits

  /**
   * Course stats
   */
  readonly stats: CourseStats

  /**
   * Terrain data
   */
  readonly terrain: TerrainElement[]

  /**
   * Track object
   */
  readonly track: Types.Track

  /**
   * Course version
   */
  readonly version: number

  /**
   * Course waypoints
   */
  readonly waypoints: Types.Waypoint[]

  /**
   * Finds or creates a point at an input location.
   *
   * @param loc - The location (in km) to determine value.
   * @returns The CoursePoint at input location.
   */
  getPoint(loc: number): Types.CoursePoint
}
