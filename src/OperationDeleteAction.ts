import { BoardManager } from "./boardManager";
import { Action } from "./Action";
import { Operation } from "./Operation";

export class OperationDeleteAction extends Operation {
    private action: Action;

    constructor(private t: number) {
        super();
        this.action = BoardManager.timeline.actions[t];
    }

    undo(): void { BoardManager.timeline.insert(this.action, this.t); }
    redo(): void { BoardManager.timeline.delete(this.t); }

}