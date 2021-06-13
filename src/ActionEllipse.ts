import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from "./Action";


export class ActionEllipse extends Action {
    
    get xMax(): number { return this.cx+ this.rx; }

    serializeData(): ActionSerialized {
        return {
            type: "ellipse",
            pause: this.pause, 
            userid: this.userid,
            cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry, color: this.color
        };
    }

    constructor(userid: string, private cx: number, private cy: number, private rx: number, private ry: number, private color: string) {
        super(userid);
    }

    getOverviewImage(): string { return "url(img/icons/26AA.svg)"; }


    async redo(): Promise<void> {
        Drawing.drawEllipse({ cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry }, this.color);
    }


}