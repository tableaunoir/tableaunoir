import { BoardManager } from './boardManager';
import { Operation } from "./Operation";
import { AnimationToolBar } from "./AnimationToolBar";


/**
 * add a specific action (draw a line, erase, etc.) at time t
 */
export class OperationMoveAction extends Operation {

    constructor(private actionIndex: number, private insertIndex: number) { super(); }

    undo(): void {
        BoardManager.timeline.moveAction(this.insertIndex, this.actionIndex);
        AnimationToolBar.update();
    }

    redo(): void {
        if (this.actionIndex < this.insertIndex)
            BoardManager.timeline.moveAction(this.actionIndex, this.insertIndex--);
        else
            BoardManager.timeline.moveAction(this.actionIndex, this.insertIndex);
        AnimationToolBar.update();
    }

}