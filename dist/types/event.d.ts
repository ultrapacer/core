export interface SunEvent {
    /**
     * Seconds since midnight when the event occurs
     */
    time: number;
    /**
     * Altitude of the sun at the event
     */
    altitude: number;
}
/**
 * Times of day (in seconds since midnight) for sun events
 */
export interface SunEvents {
    /**
     * Seconds since midnight when the sun is at its lowest point (nadir)
     */
    nadir: SunEvent;
    /**
     * Seconds since midnight at the beginning of civil twilight
     */
    dawn: SunEvent | null;
    /**
     * Seconds since midnight at sunrise
     */
    sunrise: SunEvent | null;
    /**
     * Seconds since midnight at the end of civil twilight
     */
    dusk: SunEvent | null;
    /**
     * Seconds since midnight when the sun sets
     */
    sunset: SunEvent | null;
    /**
     * Seconds since midnight when the sun is at solar noon
     */
    noon: SunEvent;
}
/**
 * Sun event type
 */
export type SunEventType = keyof SunEvents;
export interface Event {
    start: Date;
    lat: number;
    lon: number;
    timezone: string;
    /**
     * Times of day (in seconds since midnight) for sun events
     */
    sun: SunEvents;
    /**
     * get a date object at [seconds] from start
     * @param seconds - seconds from start
     */
    dateAtElapsed(seconds: number): Date;
    /**
     * get seconds since midnight for an input elapsed amount of time since start
     * @param elapsed - elapsed time
     */
    elapsedToTimeOfDay(elapsed: number): number;
}
