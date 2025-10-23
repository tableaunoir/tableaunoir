import { Drawing } from './Drawing';
import { ActionSerialized } from './ActionSerialized';
import { Action } from './Action';
import { AnimationManager } from './AnimationManager';

const DELAY = 100;

/**
 * @description action which waits a bit
 */
export class ActionWait extends Action {

    /**
     * @description this action does not give any information of the maximum of x
     */
    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "wait",
            userid: this.userid,
            delay: DELAY
        };
    }

    async redo(): Promise<void> { 
        await AnimationManager.delay(DELAY); 
     }

    createOverviewImage(): string { return "url(img/icons/E0AB.svg)"; }

}