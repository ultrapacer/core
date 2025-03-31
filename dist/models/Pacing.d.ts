import type { Types } from '..';
export declare class Pacing implements Types.Pacing {
    chunks: Types.PaceChunk[];
    plan: Types.Plan;
    constructor(plan: Types.Plan);
    clearCache(): void;
    get elapsed(): number;
    get pace(): number;
    private _factor?;
    get factor(): number;
    clearFactor(): void;
    private _factors?;
    get factors(): Types.Factors;
    /**
     * check if this pacing is current
     */
    get isCurrent(): boolean;
    get np(): number;
    get moving(): number;
    get status(): {
        complete: boolean;
        errorMessage: undefined | string;
        success: boolean;
        chunks: number;
        iterations: number[];
    };
    /**
     * last time this pacing was updated
     */
    version?: number;
    calculate(): void;
    /**
     * initialize pacing chunks array
     */
    initChunks(): void;
    /**
     * calculate pacing for each pacing chunk
     */
    calcChunks(): void;
    /**
     * make sure chunks nps increasing monotincally and merge if needed
     */
    validateChunks(): void;
    /**
     * split pacing chunk; mutates chunks array
     * @param chunk - PaceChunk to split
     * @param point - point to split at
     * @param elapsed - elapsed time at split
     */
    splitChunk(chunk: Types.PaceChunk, point: Types.PlanPoint, elapsed: number): void;
    /**
     * merge two sequential chunks together, mutates chunks array
     * @param a - first chunk
     * @param b - second chunk
     */
    mergeChunks(a: Types.PaceChunk, b: Types.PaceChunk): void;
}
