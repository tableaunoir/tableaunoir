import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from "./Action";
import { getCanvas } from './main';

export class ActionLine extends Action {
    get xMax(): number { return Math.max(this.x1, this.x2); }

    serializeData(): ActionSerialized {
        return { type: "line", userid: this.userid, x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2, color: this.color };
    }



    constructor(userid: string, private x1: number, private y1: number, private x2: number, private y2: number, private color: string) {
        super(userid);
    }


    async redo(): Promise<void> {
        Drawing.drawLine(getCanvas().getContext("2d"), this.x1, this.y1, this.x2, this.y2, 1.0, this.color);
    }

    createOverviewImage(): string { return "url(img/icons/line.svg)"; }


    get contour(): { x: number, y: number }[] {
        return [{ x: this.x1, y: this.y1 }, { x: this.x2, y: this.y2 }]
    }
}