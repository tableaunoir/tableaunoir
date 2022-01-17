import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from "./Action";


export class ActionRectangle extends Action {
    get xMax(): number { return Math.max(this.x1, this.x2); }

    serializeData(): ActionSerialized {
        return {
            type: "rectangle",  userid: this.userid,
            x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2, color: this.color
        };
    }


    constructor(userid: string, private x1: number, private y1: number, private x2: number, private y2: number, private color: string) {
        super(userid);
    }


    createOverviewImage(): string { return "url(img/icons/25AD.svg)"; }

    async redo(): Promise<void> {
        Drawing.drawRectangle({ x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 }, this.color);
    }

}