
/**
 * @description this class handles how animations are managed
 * 
 */
export class AnimationManager {
    private static delayCounter = 0; // counter used when the delay is too short (then we really delay only time to time)

    /**
     * true if all animations should end as soon as possible (no delay anymore)
     * by default, it is true (not in animation mode)
     */
    private static _mustEnd = true;

    /**
     * 
     * @param ms 
     * @returns a promise that will be resolved in ms milliseconds
     *  (or so... if ms is too small, then delayCounter is used to wait only time to time)
     *  (also, if mustEnd is true, then resolve the promise directly because we are not in animation mode anymore)
     */
    public static async delay(ms: number): Promise<void> {
        if (AnimationManager._mustEnd)
            return;
        const minRealDelay = 10;
        if (ms >= minRealDelay) {
            await AnimationManager.waitFor(ms);
        }
        if (ms > 0) {
            if (AnimationManager.delayCounter > minRealDelay / ms) {
                await AnimationManager.waitFor(ms);
                AnimationManager.delayCounter = 0;
            }
            AnimationManager.delayCounter++;
        }

    }

    /**
     * 
     * @param nbMilleSeconds 
     * @returns a promise resolved after nbMilleSeconds milliseconds. Useful for making pause in a drawing process
     */
    private static waitFor(nbMilleSeconds: number): Promise<void> {
        return new Promise(function (resolve) {
            setTimeout(resolve, nbMilleSeconds);
        });
    }

    /**
     * begin an animation
     */
    public static begin(): void { AnimationManager._mustEnd = false; }

    /**
     * declare the animation over (should be called when we know the animation is over)
     */
    public static end(): void { AnimationManager._mustEnd = true; }

    /**
    * wait til the end of animation if there is an animation that is running.
    * Otherwise, the promise directly resolves
    */
    public static ensureEnd(): Promise<void> {
        if (AnimationManager._mustEnd) return;
        AnimationManager._mustEnd = true;
        return new Promise(function (resolve) { setTimeout(resolve, 100); });// ugly fix :)
    }

    /**
     * @returns true iff an animation is running
     */
    public static get isRunning(): boolean { return !AnimationManager._mustEnd; }
}