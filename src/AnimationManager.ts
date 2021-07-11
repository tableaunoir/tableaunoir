
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
    private static mustEnd = true;


    /**
     * 
     * @param ms 
     * @returns a promise that will be resolved in ms milliseconds
     *  (or so... if ms is too small, then delayCounter is used to wait only time to time)
     *  (also, if mustEnd is true, then resolve the promise directly because we are not in animation mode anymore)
     */
    static async delay(ms: number): Promise<void> {
        if (AnimationManager.mustEnd)
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
    static begin(): void {
        console.log("start animation");
        AnimationManager.mustEnd = false;
    }


    /**
     * end an animation
     */
    static end(): void {
        console.log("stop animation");
        AnimationManager.mustEnd = true;
    }

    /**
     * @returns true iff an animation is running
     */
    static get isRunning(): boolean {
        console.log(`is running: ${!AnimationManager.mustEnd}`);
        return !AnimationManager.mustEnd;
    }

}
