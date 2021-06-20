import { Share } from './share';
import { BoardManager } from './boardManager';
import { Action } from "Action";
import { Operation } from "./Operation";


/**
 * add a specific action (draw a line, erase, etc.) at time t
 */
export class OperationAddAction extends Operation {

    constructor(private action: Action, private t: number) { super(); }

    undo(): void {
        //    BoardManager.timeline.delete(this.t); 
        const t0 = BoardManager.timeline.getTimeStepForActionCloseTo(this.action, this.t);
        console.log(t0)
        if (t0 >= 0)
            Share.execute("timelineRemoveAction", [t0]);
    }
    redo(): void {
        //    BoardManager.timeline.insert(this.action, this.t);
        Share.execute("timelineAddAction", [this.t, JSON.stringify(this.action.serialize())]);
    }

}