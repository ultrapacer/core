import type { Types } from '..';
export declare const terrainTypes: {
    type: Types.TerrainTypeIndex;
    value: number;
}[];
/**
 * Course class
 */
export declare class Course implements Types.Course {
    private _cache;
    get cache(): {
        cutoffs?: Types.CourseCutoff[];
        dist?: number;
        event?: Types.Event;
        gain?: number;
        loss?: number;
        points?: Types.CoursePoint[];
        sites?: Types.Site[];
        splits?: Types.CourseSplits;
        stats?: Types.CourseStats;
        terrain?: Types.TerrainElement[];
        waypoints?: Types.Waypoint[];
        version?: number;
    };
    /**
     * Course data
     */
    private _data;
    /**
     * Course cutoffs
     */
    get cutoffs(): CourseCutoff[];
    /**
     * Total distance of course (in km)
     */
    get dist(): number;
    /**
     * Distance scale of course (in km), relative to calculated track distance
     */
    get distScale(): number;
    get gain(): number;
    get gainScale(): number;
    get loopDist(): number;
    get loopGain(): number;
    get loopLoss(): number;
    get loops(): number;
    get loss(): number;
    get lossScale(): number;
    get points(): Types.CoursePoint[];
    get sites(): Types.Site[];
    get splits(): Types.CourseSplits;
    get stats(): Types.CourseStats;
    get terrain(): Types.TerrainElement[];
    /**
     * Track object
     */
    readonly track: Types.Track;
    /**
     * Version of course update (non-trivial changes that affect pacing)
     */
    version: number;
    get waypoints(): Types.Waypoint[];
    constructor(track: Types.Track, data: Types.CourseData);
    update(data: Types.CourseUpdateData): void;
    /**
     * Finds or creates a point at an input location.
     *
     * @param loc - The location (in km) to determine value.
     * @returns The CoursePoint at input location.
     */
    getPoint(loc: number): Types.CoursePoint;
    locationsToBreaks(locations: number[]): {
        start: number;
        end: number;
    }[];
}
export declare class CourseCutoff implements Types.CourseCutoff {
    waypoint: Types.Waypoint;
    constructor(waypoint: Types.Waypoint);
    get loc(): number;
    get time(): number;
}
