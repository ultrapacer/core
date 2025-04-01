import type { Types } from '..';
export interface Segment {
    /**
     * altitude (m) at end of segment
     */
    alt: number;
    /**
     * distance (km) of segment
     */
    dist: number;
    /**
     * location along course (km) at end of segment
     */
    end: number;
    /**
     * elevation gain (m) over segment
     */
    gain: number;
    /**
     * average grade (%) over segment
     */
    grade: number;
    /**
     * elevation loss (m) over segment
     */
    loss: number;
    name?: string | undefined;
    point1: Types.CoursePoint | Types.PlanPoint;
    point2: Types.CoursePoint | Types.PlanPoint;
    /**
     * location along course (km) at start of segment
     */
    start: number;
    /**
     * waypoint at end of segment
     */
    waypoint?: Types.Waypoint;
}
export interface CourseSegment extends Segment {
    point1: Types.CoursePoint;
    point2: Types.CoursePoint;
}
export interface PlanSegment extends Segment {
    /**
     * moving pace (s/km) over segment
     */
    pace: number;
    /**
     * delay (s) over segment
     */
    delay: number;
    /**
     * elapsed time (s) over segment
     */
    elapsed: number;
    factors: Types.Factors;
    point1: Types.PlanPoint;
    point2: Types.PlanPoint;
    /**
     * moving time (s) over segment
     */
    time: number;
    /**
     * time of day (s) at end of segment
     */
    tod: number;
}
type SegmentBreak = {
    start: number;
    end: number;
};
export type CourseSplits = {
    segments: (CourseSegment & {
        waypoint: Types.Waypoint;
    })[];
    miles: CourseSegment[];
    kilometers: CourseSegment[];
    calcSegments(breaks: SegmentBreak[]): CourseSegment[];
};
export type PlanSplits = {
    segments: (PlanSegment & {
        waypoint: Types.Waypoint;
    })[];
    miles: PlanSegment[];
    kilometers: PlanSegment[];
    calcSegments(breaks: SegmentBreak[]): PlanSegment[];
};
export {};
