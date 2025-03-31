import type { Types } from '..';
export declare class Track implements Types.Track {
    dist: number;
    gain: number;
    loss: number;
    points: Types.TrackPoint[];
    constructor(llas: Types.TrackData);
    get start(): Pick<Types.TrackPoint, "alt" | "lat" | "lon">;
    get finish(): Pick<Types.TrackPoint, "alt" | "lat" | "lon">;
    getLLA(location: number): {
        lat: number;
        lon: number;
        alt: number;
    };
    reduceDensity(spacing?: number, length?: number): Track;
}
export declare function createTrackFromArrays(lat: number[], lon: number[], alt: number[]): Track;
