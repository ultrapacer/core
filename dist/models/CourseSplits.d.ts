import type { Types } from '..';
export declare class CourseSplits implements Types.CourseSplits {
    private _segments?;
    private _miles?;
    private _kilometers?;
    course: Types.Course;
    constructor(course: Types.Course);
    get segments(): (Types.CourseSegment & {
        waypoint: Types.Waypoint;
    })[];
    set segments(v: (Types.CourseSegment & {
        waypoint: Types.Waypoint;
    })[]);
    get miles(): Types.CourseSegment[];
    set miles(v: Types.CourseSegment[]);
    get kilometers(): Types.CourseSegment[];
    set kilometers(v: Types.CourseSegment[]);
    createSegments(): Types.CourseSegment[];
    createSplits(unit: string): Types.CourseSegment[];
    calcSegments(breaks: {
        start: number;
        end: number;
    }[]): Types.CourseSegment[];
}
