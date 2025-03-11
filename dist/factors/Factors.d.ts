export type FactorsObject = {
    altitude: number;
    climbStrategy: number;
    descentStrategy: number;
    grade: number;
    terrain: number;
    heat: number;
    dark: number;
    fatigue: number;
    strategy: number;
};
export type FactorsKeys = keyof FactorsObject;
export declare const factorKeys: FactorsKeys[];
export declare class Factors {
    private _data;
    private _combined?;
    constructor(value?: Partial<FactorsObject>);
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
    get fatigue(): number;
    set fatigue(v: number);
    get strategy(): number;
    set strategy(v: number);
    get combined(): number;
    /**
     * @param f - function to apply
     * @param factors - factor list to apply
     */
    applyEach(f: (val: number, factor2: number) => number, factors: Factors): void;
    /**
     * get object representation
     */
    toObject(): FactorsObject;
    /**
     * scale each factor
     * @param scale - scale to apply
     */
    scaleEach(scale: number): this;
}
