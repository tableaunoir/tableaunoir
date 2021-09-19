import { ConstraintDrawing } from './ConstraintDrawing';
import { ToolDraw } from './ToolDraw';
import { Geometry } from './Geometry';
import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Action } from './Action';

export class ActionFill extends Action {
    get xMin(): number { return Math.min(...this.points.map((p) => p.x)); }
    get xMax(): number { return Math.max(...this.points.map((p) => p.x)); }
    get yMin(): number { return Math.min(...this.points.map((p) => p.y)); }
    get yMax(): number { return Math.max(...this.points.map((p) => p.y)); }


    constructor(userid: string, public points: { x: number; y: number; }[], public color: string) {
        super(userid);
    }


    serializeData(): ActionSerialized {
        return { type: "fill", pause: this.pause, userid: this.userid, points: this.points, color: this.color };
    }




    async redo(): Promise<void> {
        const ctx = getCanvas().getContext("2d");
        Drawing.fill(ctx, this.points, this.color);
    }



    createOverviewImage(): string { return "url(img/icons/1F58C.svg)"; }

    
}



