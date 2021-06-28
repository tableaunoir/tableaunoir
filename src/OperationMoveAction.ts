import { BoardManager } from './boardManager';
import { Action } from "Action";
import { Operation } from "./Operation";


/**
 * add a specific action (draw a line, erase, etc.) at time t
 */
export class OperationMoveAction extends Operation {

    constructor(private actionIndex: number, private insertIndex: number) { super(); }

    undo(): void {
        BoardManager.timeline.move(this.insertIndex, this.actionIndex);
    }

    redo(): void {
        BoardManager.timeline.move(this.actionIndex, this.insertIndex);
    }

}