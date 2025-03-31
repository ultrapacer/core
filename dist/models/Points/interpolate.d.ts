import type { Types } from '../..';
import { Models } from '../..';
/**
 * interpolate between two track points
 * @param p1 - first point
 * @param p2 - second point
 * @param loc - location
 * @returns new TrackPoint
 */
export declare function interpolatePoint(p1: Types.TrackPoint, p2: Types.TrackPoint, loc: number): Models.TrackPoint;
