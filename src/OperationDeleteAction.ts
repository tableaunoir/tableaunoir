import { Share } from './share';
import { BoardManager } from "./boardManager";
import { Action } from "./Action";
import { Operation } from "./Operation";

export class OperationDeleteAction extends Operation {
    private action: Action;

    constructor(private t: number) {
        super();
        this.action = BoardManager.timeline.actions[t];
    }

    undo(): void {
        Share.execute("timelineAddAction", [this.t, JSON.stringify(this.action.serialize())]);

        // BoardManager.timeline.insert(this.action, this.t); 
    }


    redo(): void {
        const t0 = BoardManager.timeline.getTimeStepForActionCloseTo(this.action, this.t);
        if (t0 >= 0)
            Share.execute("timelineRemoveAction", [t0]);
        //BoardManager.timeline.delete(this.t);
    }

}