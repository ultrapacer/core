import type { Types } from '..';
import { Factors } from '../factors';
export declare class PaceChunk implements Types.PaceChunk {
    constraints: (number | (() => number))[];
    constructor(plan: Types.Plan, points: Types.PlanPoint[], constraints: (number | (() => number))[], delay: number);
    points: Types.PlanPoint[];
    plan: Types.Plan;
    delay: number;
    factor: number;
    factors: Factors;
    status?: Types.PaceChunk['status'] | undefined;
    get elapsed(): number;
    get dist(): number;
    get pace(): number;
    get np(): number;
    get moving(): number;
    /**
     * apply pacing to chunk points, update factors
     */
    applyPacing(): void;
    /**
     * iterate applyPacing method until tests pass
     */
    calculate(): void;
}
