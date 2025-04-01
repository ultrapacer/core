import type { Types } from '../';
export declare const factorKeys: Types.FactorsKeys[];
export declare class Factors implements Types.Factors {
    private _data;
    private _combined?;
    constructor(value?: Partial<Types.FactorsObject>);
    init(val: number): this;
    get altitude(): number;
    set altitude(v: number);
    get climbStrategy(): number;
    set climbStrategy(v: number);
    get descentStrategy(): number;
    set descentStrategy(v: number);
    get grade(): number;
    set grade(v: number);
    get terrain(): number;
    set terrain(v: number);
    get heat(): number;
    set heat(v: number);
    get dark(): number;
    set dark(v: number);
    get strategy(): number;
    set strategy(v: number);
    get combined(): number;
    /**
     * @param f - function to apply
     * @param factors - factor list to apply
     */
    applyEach(f: (val: number, factor2: number) => number, factors: Types.FactorsObject): void;
    /**
     * scale each factor
     * @param scale - scale to apply
     */
    scaleEach(scale: number): this;
}
