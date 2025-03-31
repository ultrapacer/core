import type { Site } from './site'

/**
 * Waypoint type
 */
export interface Waypoint
  extends Pick<
    Site,
    'alt' | 'description' | 'lat' | 'lon' | 'name' | 'hasDelay' | 'isFinish' | 'isStart'
  > {
  /**
   * cutoff time for the waypoint
   */
  readonly cutoff?: number | undefined

  /**
   * location along the course (in km)
   */
  readonly loc: number

  /**
   * loop number (1-indexed)
   */
  readonly loop: number

  /**
   * site for the waypoint
   */
  readonly site: Site
}
