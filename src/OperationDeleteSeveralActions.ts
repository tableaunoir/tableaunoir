import { BoardManager } from "./boardManager";
import { Action } from "./Action";
import { Operation } from "./Operation";

export class OperationDeleteSeveralActions extends Operation {
    private actionsTable: Action[];

    constructor(private indices: number[]) {
        super();
        this.actionsTable = this.indices.map(index => BoardManager.timeline.actions[index]);
    }   

    undo(): void {
        BoardManager.timeline.insertActions(this.indices, this.actionsTable);
        /**
         * TODO: this code is too slow because the board tries to refresh itself at each action insertion!
         * TODO: the current code is not shared but no one uses Tableaunoir in presentation mode and sharing
         * for (let i = 0; i < this.actionsTable.length; i++) {
            Share.execute("timelineAddAction", [this.indices[i], JSON.stringify(this.actionsTable[i].serialize())]);
        }*/
    }


    redo(): void {
        BoardManager.timeline.deleteActions(this.indices);
        /*
        TODO: this code is too slow because the board tries to refresh itself at each action removal!
        TODO: the current code is not shared but no one uses Tableaunoir in presentation mode and sharing
        for (let i = this.actionsTable.length - 1; i > -1; i--) {
            const t0 = BoardManager.timeline.getTimeStepForActionCloseTo(this.actionsTable[i], this.indices[i]);
            if (t0 >= 0)
                Share.execute("timelineRemoveAction", [t0]);
            //BoardManager.timeline.delete(t0);
        }*/
    }

}