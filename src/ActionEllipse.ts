import { Drawing } from './Drawing';
import { Action } from "./Action";


export class ActionEllipse extends Action {
    constructor(userid: string, private cx: number, private cy: number, private rx: number, private ry: number, private color: string) {
        super(userid);
    }

    async redo(): Promise<void> {
        Drawing.drawEllipse({ cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry }, this.color);
    }

}