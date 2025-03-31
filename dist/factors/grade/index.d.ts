import type { GradeModel } from './GradeModel';
/**
 * get grade factor
 * @param grade - grade as percentage (positive up, negative down)
 * @param model - grade model to use
 * @returns grade factor
 */
export declare function getGradeFactor(grade: number, model?: GradeModel): number;
