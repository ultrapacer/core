import type { Types } from '..';
export declare class PlanSplits implements Types.PlanSplits {
    plan: Types.Plan;
    constructor(plan: Types.Plan);
    get segments(): (Types.PlanSegment & {
        waypoint: Types.Waypoint;
    })[];
    set segments(v: (Types.PlanSegment & {
        waypoint: Types.Waypoint;
    })[]);
    private _segments?;
    private _segmentsVersion?;
    get miles(): Types.PlanSegment[];
    set miles(v: Types.PlanSegment[]);
    private _miles?;
    private _milesVersion?;
    get kilometers(): Types.PlanSegment[];
    set kilometers(v: Types.PlanSegment[]);
    private _kilometers?;
    private _kilometersVersion?;
    createSegments(): Types.PlanSegment[];
    createSplits(unit: string): Types.PlanSegment[];
    calcSegments(breaks: {
        start: number;
        end: number;
    }[]): Types.PlanSegment[];
}
