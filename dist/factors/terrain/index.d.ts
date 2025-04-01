import type { Types } from '../..';
/**
 * Return a scaling factor for terrain
 *
 * @param point  - Point object per /models/Point
 * @param course - Course object per /models/Course
 *
 * @returns The terrain factor at the provided point
 */
export declare function getTerrainFactor(point: Types.CoursePoint | Types.PlanPoint, course: Types.Course): number;
