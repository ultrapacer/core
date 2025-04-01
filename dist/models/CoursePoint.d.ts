import type { Types } from '..';
import { Factors } from '../factors/Factors';
import { TrackPoint } from './Point';
/**
 * CoursePoint object for use in a course, including scaling and loop data
 */
export declare class CoursePoint extends TrackPoint implements Types.CoursePoint {
    private _course;
    factors: Factors;
    get grade(): number;
    get interpolated(): boolean;
    set interpolated(value: boolean);
    private _interpolated?;
    get loc(): number;
    loop: number;
    readonly source: Types.TrackPoint | Types.CoursePoint;
    constructor(course: Types.Course, point: Types.TrackPoint, loop: number);
}
