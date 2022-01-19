import { ActionSerialized } from './ActionSerialized';
import { Action } from './Action';
/**
 * @description action which ends a slide
 */
export class ActionSlideStart extends Action {

    /**
     * @description as the full board is cleared, this action does not give any information of the maximum of x
     */
    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "slidestart",
            userid: this.userid
        };
    }

    async redo(): Promise<void> {
        /* do nothing*/
    }

    createOverviewImage(): string { return undefined; }

}