import type { Types } from '..';
declare class Segment implements Types.Segment {
    constructor(obj: {
        point1: Types.CoursePoint | Types.PlanPoint;
        point2: Types.CoursePoint | Types.PlanPoint;
        gain: number;
        loss: number;
        grade: number;
        name?: string;
    });
    point1: Types.CoursePoint | Types.PlanPoint;
    point2: Types.CoursePoint | Types.PlanPoint;
    gain: number;
    loss: number;
    grade: number;
    waypoint?: Types.Waypoint;
    private _name?;
    get name(): string | undefined;
    get start(): number;
    get dist(): number;
    get end(): number;
    get alt(): number;
}
export declare class CourseSegment extends Segment implements Types.CourseSegment {
    point1: Types.CoursePoint;
    point2: Types.CoursePoint;
    constructor(_course: Types.Course, obj: {
        point1: Types.CoursePoint;
        point2: Types.CoursePoint;
        gain: number;
        loss: number;
        grade: number;
    });
}
export declare class PlanSegment extends Segment implements Types.PlanSegment {
    private _plan;
    point1: Types.PlanPoint;
    point2: Types.PlanPoint;
    constructor(plan: Types.Plan, obj: {
        point1: Types.PlanPoint;
        point2: Types.PlanPoint;
        gain: number;
        loss: number;
        grade: number;
    });
    get pace(): number;
    get delay(): number;
    get elapsed(): number;
    get time(): number;
    get tod(): number;
    set delay(_v: number);
    set pace(_v: number);
    set elapsed(_v: number);
    set time(_v: number);
    set tod(_v: number);
    private _factors?;
    get factors(): Types.Factors;
}
export {};
