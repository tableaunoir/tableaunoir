import { Share } from './share';
import { BoardManager } from './boardManager';
import { Action } from "Action";
import { Operation } from "./Operation";

/**
 * add a specific action (draw a line, erase, etc.) at time t
 */
export class OperationMagnetize extends Operation {

    private actionContour: Action;


    constructor(private userid: string, private taction: number, private cut: boolean, private magnetid: string) {
        super();
        this.actionContour = BoardManager.timeline.actions[taction];

    }


    undo(): void {
        Share.execute("undomagnetize", [this.userid, this.taction, this.cut, JSON.stringify(this.actionContour.serialize())]);
    }


    redo(): void {
        Share.execute("magnetize", [this.userid, this.magnetid, this.taction, this.cut]);
    }

}