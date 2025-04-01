import type { Types } from '../..';
/**
 * get scale factor for time of day
 * @param sun - sun model
 * @param ssm - seconds since midnight
 * @returns scale factor
 */
export declare function scale(sun: Types.SunEvents, ssm: number): number;
