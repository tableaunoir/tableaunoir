import { ConstraintDrawing } from './ConstraintDrawing';
import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";
import { MagnetMovementUpdater } from './MagnetMovementRecorder';
import { MagnetManager } from './magnetManager';
import { ShowMessage } from './ShowMessage';



export class ActionMagnetMove extends Action {
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
    constructor(userid: string, public magnetid: string, points: { x: number; y: number; }[]) {
        super(userid);
        this.points = points;
        this.isDirectlyUndoable = true;
    }

    createOverviewImage(): string { return "url(img/icons/magnetMove.svg)"; }


    get pointsCentered(): { x: number, y: number }[] {
        const magnet = document.getElementById(this.magnetid);
        if (magnet) {
            const mx = magnet.offsetWidth / 2;
            const my = magnet.offsetHeight / 2;
            return this.points.map(({ x, y }) => ({ x: x + mx, y: y + my }));
        }
        else
            return this.points;
    }

    private setPosition(point: { x: number, y: number }): void {
        const magnet = document.getElementById(this.magnetid);
        if (magnet) {
            MagnetMovementUpdater.update(magnet, point.x, point.y);
            ConstraintDrawing.update();
        }

    }

    /**
     * @description check whether the magnet is here. If not, try to reassign to a close magnet
     */
    private check() {
        const magnet = document.getElementById(this.magnetid);
        if (magnet == undefined || magnet.style.visibility == "hidden") {
            ShowMessage.show("Temporal paradox fixed!");
            this.reassign();
        }
    }

    /**
     * reassign a magnet (because the current one is not here anymore)
     */
    private reassign() {
        const pt = this.points[0];
        const newmagnet = MagnetManager.getMagnetNearPoint(pt);

        if (newmagnet)
            this.magnetid = newmagnet.id;
    }



    get lastPoint(): { x: number, y: number } { return this.points[this.points.length - 1]; }
    async redo(): Promise<void> { this.check(); this.setPosition(this.lastPoint); }

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