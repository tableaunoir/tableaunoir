import { AnimationToolBar } from './AnimationToolBar';
import { BoardManager } from './boardManager';
import { Operation } from "./Operation";

export class OperationPauseAction extends Operation {

    constructor(private t: number) { super() }

    private do(): void {
        const action = BoardManager.timeline.actions[this.t];
        action.pause = !action.pause;
        AnimationToolBar.updateActionPause(this.t);
    }

    undo(): void { this.do() }
    redo(): void { this.do() }

}