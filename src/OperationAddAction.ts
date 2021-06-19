import { BoardManager } from './boardManager';
import { Action } from "Action";
import { Operation } from "./Operation";


/**
 * add a specific action (draw a line, erase, etc.) at time t
 */
export class OperationAddAction extends Operation {
    constructor(private action: Action, private t: number) { super(); }

    undo(): void { BoardManager.timeline.delete(this.t); }
    redo(): void { BoardManager.timeline.insert(this.action, this.t); }

}