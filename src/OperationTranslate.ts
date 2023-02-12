import { BoardManager } from "./boardManager";
import { Action } from "./Action";
import { Operation } from "./Operation";
import { ActionFreeDraw } from "./ActionFreeDraw";


/**
 * Translate some drawings
 */
export class OperationTranslate extends Operation {

    /**
     * 
     * @param indices the indices of the actions to be deleted (in the increasing order)
     */
    constructor(private indices: number[], private vector: { x: number, y: number }) {
        super();
    }


    _translate(v: { x: number, y: number }) {
        for (const i of this.indices) {
            const a = BoardManager.timeline.actions[i];

            if (a instanceof ActionFreeDraw)
                for (const p of a.points) {
                    p.x += v.x;
                    p.y += v.y;
                }
        }
    }
    
    undo(): void { this._translate({ x: -this.vector.x, y: -this.vector.y }); }
    async redo(): Promise<void> { this._translate(this.vector); }

}