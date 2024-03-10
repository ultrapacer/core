/**
 * @param start     - start time of day in seconds
 * @param stop      - stop time of day in seconds
 * @param max       - max heat %
 * @param baseline  - baseline heat %
 */
export type HeatModel = {
  start: number
  stop: number
  max: number
  baseline: number
}
