import type { factors, Types } from '..';
/**
 * Interface representing the tests for pacing.
 */
export interface PacingTests {
    /**
     * Indicates if the iterations test passed.
     */
    iterations: boolean;
    /**
     * Indicates if the factor test passed.
     */
    factor: boolean;
    /**
     * Indicates if the points test passed.
     */
    points: boolean;
    /**
     * Indicates if the target test passed.
     */
    target: boolean;
    /**
     * Indicates if all tests passed.
     */
    passing: boolean;
}
/**
 * Interface representing the status of a pacing chunk.
 */
export interface PaceChunkStatus {
    /**
     * Error message if the chunk was not successful.
     */
    errorMessage?: string | undefined;
    /**
     * Indicates if the chunk was successful.
     */
    success: boolean;
    /**
     * The tests associated with the chunk.
     */
    tests: PacingTests;
    /**
     * The number of iterations for the chunk.
     */
    iterations: number;
}
/**
 * Interface representing a chunk of pacing data.
 */
export interface PaceChunk {
    /**
     * An array of constraints, which can be numbers or functions returning numbers.
     */
    constraints: (number | (() => number))[];
    /**
     * The delay associated with the chunk (seconds).
     */
    delay: number;
    /**
     * The distance associated with the chunk (kilometer).
     */
    dist: number;
    /**
     * The factor associated with the chunk.
     */
    factor: number;
    /**
     * The factors associated with the chunk.
     */
    factors: factors.Factors;
    /**
     * The normalized pace for the chunk (seconds/kilometer).
     */
    np: number;
    /**
     * An array of plan points associated with the chunk.
     */
    points: Types.PlanPoint[];
    /**
     * The status of the chunk, which may include success, tests, and iterations.
     */
    status?: PaceChunkStatus | undefined;
    /**
     * Calculates the pacing data for the chunk.
     */
    calculate(): void;
}
export interface PacingStatus {
    /**
     * Indicates if the pacing is complete.
     */
    complete: boolean;
    /**
     * Error message if the pacing was not successful.
     */
    errorMessage?: string | undefined;
    /**
     * Indicates if the pacing was successful.
     */
    success: boolean;
    /**
     * Number of chunks pacing was split into.
     */
    chunks: number;
    /**
     * An array of iteration totals for each chunk.
     */
    iterations: number[];
}
/**
 * Interface representing the pacing data.
 */
export interface Pacing {
    /**
     * An array of pacing chunks.
     */
    chunks: Types.PaceChunk[];
    /**
     * The elapsed time (seconds).
     */
    elapsed: number;
    isCurrent: boolean;
    /**
     * The factor associated with the pacing.
     */
    factor: number;
    /**
     * The factors associated with the pacing.
     */
    factors: factors.Factors;
    /**
     * The moving time (seconds).
     */
    moving: number;
    /**
     * The normalized pace (seconds/kilometer).
     */
    np: number;
    /**
     * The pace value (seconds/kilometer).
     */
    pace: number;
    /**
     * The status of the pacing, including completion, success, and number of chunks.
     */
    status: PacingStatus;
    /**
     * Calculates the pacing data.
     */
    calculate(): void;
    /**
     * Clears the cache of the pacing data.
     */
    clearCache(): void;
    /**
     * Clears the factor of the pacing data.
     */
    clearFactor(): void;
}
