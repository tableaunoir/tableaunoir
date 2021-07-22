import { Drawing } from './Drawing';
import { ActionSerialized } from './ActionSerialized';
import { Action } from './Action';


/**
 * @description action which completely clears the board
 */
export class ActionClear extends Action {

    /**
     * @description as the full board is cleared, this action does not give any information of the maximum of x
     */
    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "clear",
            pause: this.pause,
            userid: this.userid
        };
    }

    async redo(): Promise<void> { 
        Drawing.clear();
        document.getElementById("svg").innerHTML = "";
        document.getElementById("magnets").innerHTML = "";
     }

    createOverviewImage(): string { return "url(img/icons/supererase.svg)"; }

}