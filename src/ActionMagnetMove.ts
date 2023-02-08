import { ConstraintDrawing } from './ConstraintDrawing';
import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";
import { MagnetMovementUpdater } from './MagnetMovementRecorder';



export class ActionMagnetMove extends Action {
    readonly magnetid: string;
    readonly points: { x: number; y: number; }[] = [];

    get xMax(): number {
        const magnet = document.getElementById(this.magnetid);
        const w = magnet ? magnet.offsetWidth : 0;
        return Math.max(...this.points.map((p) => p.x)) + w;
    }

    serializeData(): ActionSerialized {
        return {
            type: "magnetmove",
            userid: this.userid, magnetid: this.magnetid, points: this.points
        };
    }


    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param points a NON-EMPTY list of points
     */
    constructor(userid: string, magnetid: string, points: { x: number; y: number; }[]) {
        super(userid);
        this.magnetid = magnetid;
        this.points = points;
        this.isDirectlyUndoable = true;
    }

    createOverviewImage(): string { return "url(img/icons/magnetMove.svg)"; }


    private setPosition(point: { x: number, y: number }): void {
        const magnet = document.getElementById(this.magnetid);
        if (magnet) {
            MagnetMovementUpdater.update(magnet, point.x, point.y);
            ConstraintDrawing.update();
        }

    }

    async redo(): Promise<void> { this.setPosition(this.points[this.points.length - 1]); }

    async undo(): Promise<void> { this.setPosition(this.points[0]); }

    /**
   * 
   * @returns 
   */
    async redoAnimated(): Promise<void> {
        for (let i = 0; i < this.points.length; i++) {
            this.setPosition(this.points[i]);
            await this.delay();
        }

    }

}