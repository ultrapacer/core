import type { HeatModel } from './HeatModel';
/**
 * Return a scaling factor for heat
 *
 * @param point - Point object per /models/Point
 * @param model - Heat model
 * @returns  The heat factor at the provided point
 */
export declare function getHeatFactor(point: {
    tod: number;
}, model?: HeatModel): number;
