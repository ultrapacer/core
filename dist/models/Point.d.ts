import { Types } from '../main';
export declare function isSourcePoint(arg: Types.LLA | Point): arg is Point;
/**
 * Point object for use as a basis in a track or course
 */
export declare class Point implements Types.Point {
    get alt(): number;
    set alt(value: number);
    get lat(): number;
    set lat(value: number);
    get lon(): number;
    set lon(value: number);
    source: {
        alt: number;
        lat: number;
        lon: number;
    } | Point;
    constructor(arg: Point | Types.LLA);
}
/**
 * TrackPoint object for use in a track, with additional data (loc, grade)
 */
export declare class TrackPoint extends Point implements Types.TrackPoint {
    private _trackData;
    get grade(): number;
    get loc(): number;
    constructor(arg: Point | Types.LLA, loc: number, grade: number);
}
