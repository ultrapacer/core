import type { Types } from '../..';
import type { StrategyElement, StrategyElementType } from './StrategyElement';
export declare class Strategy {
    plan: Types.Plan;
    values: StrategyElement[];
    constructor(plan: Types.Plan, values?: StrategyElement[]);
    /**
     * Returns strategy factor at location.
     *
     * @param loc - The location (in km) to determine value.
     * @returns  The strategy factor at input location.
     */
    at(loc: number): number;
    addValue(val: StrategyElement): void;
}
export type { StrategyElement, StrategyElementType };
