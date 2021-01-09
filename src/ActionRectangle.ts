import { Drawing } from './Drawing';
import { Action } from "./Action";


export class ActionRectangle extends Action {



    serialize(): Object {
        return {
            type: "rectangle",
            x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2
        };
    }


    constructor(userid: string, private x1: number, private y1: number, private x2: number, private y2: number, private color: string) {
        super(userid);
    }


    async redo(): Promise<void> {
        Drawing.drawRectangle({ x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 }, this.color);
    }

}