import type { Types } from '..';
export declare class Plan implements Types.Plan {
    private _cache;
    get cache(): {
        cutoffs?: PlanCutoff[];
        delays?: Types.Plan["delays"];
        event?: Types.Event;
        events?: Types.Plan["events"];
        gradeModel?: Types.PlanGradeModel;
        heatModel?: Types.PlanHeatModel;
        stats?: Types.Plan["stats"];
        strategy?: Types.Strategy;
        strategies?: Types.PlanStrategies;
        version?: number;
    };
    private _data;
    get strategies(): Types.PlanStrategies;
    readonly course: Types.Course;
    get cutoffMargin(): number | undefined;
    get cutoffs(): PlanCutoff[];
    get delay(): number;
    get delays(): PlanDelay[];
    get event(): Types.Event;
    get events(): Types.PlanEvents;
    get gradeModel(): Types.PlanGradeModel | undefined;
    get heatModel(): {
        start: number;
        stop: number;
        baseline: number;
        max: number;
    } | undefined;
    get id(): string | number | symbol | null | undefined;
    get method(): Types.PlanDataMethod;
    get name(): string | undefined;
    pacing: Types.Pacing;
    readonly points: Types.PlanPoint[];
    get scales(): Types.PlanScales | undefined;
    readonly splits: Types.PlanSplits;
    get stats(): Types.PlanStats;
    get strategy(): Types.Strategy;
    get target(): number;
    get typicalDelay(): number;
    /**
     * Version of plan update (non trivial changes that affect pacing)
     */
    _version: number;
    /**
     * Version of course & plan update (non trivial changes that affect pacing)
     */
    get version(): number;
    constructor(course: Types.Course, data: Types.PlanData);
    checkPacing(): boolean;
    getDelayAtWaypoint(waypoint: Types.Waypoint): number;
    getPoint(loc: number, insert?: boolean): Types.PlanPoint;
    update(data: Types.PlanUpdateData): void;
}
declare class PlanDelay implements Types.PlanDelay {
    delay: number;
    waypoint: Types.Waypoint;
    constructor(waypoint: Types.Waypoint, delay: number);
    get loc(): number;
}
declare class PlanCutoff implements Types.PlanCutoff {
    plan: Types.Plan;
    courseCutoff: Types.CourseCutoff;
    point: Types.PlanPoint;
    constructor(plan: Types.Plan, courseCutoff: Types.CourseCutoff, point: Types.PlanPoint);
    get waypoint(): Types.Waypoint;
    get loc(): number;
    get time(): number;
}
export {};
