import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from "./Action";


export class ActionEllipse extends Action {

    get xMax(): number { return this.cx + this.rx; }

    serializeData(): ActionSerialized {
        return {
            type: "ellipse",
            userid: this.userid,
            cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry, color: this.color
        };
    }

    constructor(userid: string, private cx: number, private cy: number, private rx: number, private ry: number, private color: string) {
        super(userid);
    }

    createOverviewImage(): string { return "url(img/icons/26AA.svg)"; }


    async redo(): Promise<void> {
        Drawing.drawEllipse({ cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry }, this.color);
    }


    /**
     * the contour for making a magnet of the shape of an ellipse
     */
    get contour(): { x: number; y: number; }[] {
        const precision = 200;
        const A = []

        for (let i = 0; i < precision; i++) {
            const angle = 2 * Math.PI * i / precision;
            A.push({ x: this.cx + this.rx * Math.cos(angle), y: this.cy + this.ry * Math.sin(angle) });
        }
        return A;
    }

}