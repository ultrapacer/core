export type { Factors, FactorsObject } from '../factors';
export type { Strategy, StrategyElement, StrategyElementType } from '../factors/strategy';
export type * from './course';
export type * from './event';
export type * from './pacing';
export type * from './plan';
export type * from './point';
export type * from './segment';
export type * from './site';
export type * from './track';
export type * from './waypoint';
export interface DateWithTimezone {
    date: Date;
    timezone: string;
}
/**
 * Latitude, Longitude, Altitude (LLA) object for creation of a point
 */
export type LLA = {
    /**
     * altitude in meters
     */
    alt: number;
    /**
     * latitude in degrees
     */
    lat: number;
    /**
     * longitude in degrees
     */
    lon: number;
};
