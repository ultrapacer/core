import type { Types } from '..';
/**
 * Data used to create a track.
 */
export type TrackData = {
    /**
     * The latitude of the point.
     */
    lat: number;
    /**
     * The longitude of the point.
     */
    lon: number;
    /**
     * The altitude of the point.
     */
    alt: number;
}[];
/**
 * Represents a track with various properties and methods to interact with it.
 */
export interface Track {
    /**
     * The total distance of the track in kilometers.
     */
    readonly dist: number;
    /**
     * The total elevation gain of the track in meters.
     */
    readonly gain: number;
    /**
     * The total elevation loss of the track in meters.
     */
    readonly loss: number;
    /**
     * An array of track points that make up the track.
     */
    readonly points: Types.TrackPoint[];
    /**
     * The starting location of the track.
     */
    readonly start: Types.LLA;
    /**
     * The finishing location of the track.
     */
    readonly finish: Types.LLA;
    /**
     * Gets the latitude, longitude, altitude, and index for a given distance location along the track.
     * @param location - The distance location along the track.
     * @returns The latitude, longitude, and altitude at the specified location.
     */
    getLLA(location: number): Types.LLA;
    /**
     * Reduces the density of track points based on the specified spacing and length.
     * @param spacing - The desired spacing between points (optional).
     * @param length - The desired length of the track (optional).
     * @returns A new track with reduced point density.
     */
    reduceDensity(spacing?: number, length?: number): Track;
}
