import { Drawing } from './Drawing';
import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";



export class ActionMagnetMove extends Action {
    readonly magnetid: string;
    readonly points: { x: number; y: number; }[] = [];


    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetmove",
            pause: this.pause, userid: this.userid, magnetid: this.magnetid, points: this.points
        };
    }


    constructor(userid: string, magnetid: string, points: { x: number; y: number; }[]) {
        super(userid);
        this.magnetid = magnetid;
        this.points = points;
    }


    private setPosition(point: { x: number, y: number }): void {
        document.getElementById(this.magnetid).style.left = point.x + "px";
        document.getElementById(this.magnetid).style.top = point.y + "px";
    }

    async redo(): Promise<void> {
        this.setPosition(this.points[this.points.length - 1]);
    }

    /**
   * 
   * @returns 
   */
    async redoAnimated(): Promise<void> {
        for (let i = 0; i < this.points.length; i++) {
            this.setPosition(this.points[i]);
            await Drawing.delay(1);
        }

    }

}