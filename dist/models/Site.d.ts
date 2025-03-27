import { Types } from '../main';
export declare class Site implements Types.Site {
    /**
     * internal cache object
     * gets deleted and regenerated when version changes
     */
    private _cache;
    get cache(): {
        _version?: number;
        alt?: number;
        lat?: number;
        lon?: number;
        waypoints?: Types.Waypoint[];
    };
    /**
     * internal data object
     */
    private _data;
    get alt(): number;
    readonly course: Types.Course;
    get cutoffs(): {
        loop: number;
        time: number;
    }[];
    get description(): string | undefined;
    get hasDelay(): boolean | undefined;
    get id(): string | symbol | undefined;
    get isFinish(): boolean | undefined;
    get isStart(): boolean | undefined;
    get lat(): number;
    get lon(): number;
    get name(): string | undefined;
    get percent(): number;
    set percent(v: number);
    get version(): number;
    get waypoints(): Types.Waypoint[];
    constructor(course: Types.Course, data: Types.SiteData);
    refreshLLA(): void;
}
