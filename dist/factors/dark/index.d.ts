import type { Types } from '../..';
import type { DarkModel } from './DarkModel';
/**
 * Return time-of-day based dark factor
 *
 * @param   timeOfDaySeconds - Time of day (in seconds)
 * @param   terrainFactor  -  Terrain %
 * @param   sun  -            Sun model, object w/ dawn, sunrise, sunset, dusk in time-of-day seconds
 * @param   model -       Darkness model (see ./defaults)
 *
 * @returns  The heat factor at the provided point
 */
export declare function getDarkFactor(timeOfDaySeconds: number, terrainFactor: number, sun: Types.SunEvents, model?: DarkModel): number;
