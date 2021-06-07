import { Geometry } from './Geometry';
import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from './Action';

/**
 * Action for erasing
 */
export class ActionErase extends Action {
    get xMax(): number { return Math.max(...this.points.map((p) => p.x)); }

    serializeData(): ActionSerialized {
        return { type: "erase", pause: this.pause, userid: this.userid, points: this.points };
    }

    private points: { x: number; y: number; lineWidth: number }[] = [];

    /**
     * 
     * @param pt 
     * @description add a new point in the path to be erased
     */
    addPoint(pt: { x: number; y: number; lineWidth: number }): void {
        pt.x = Geometry.numberRound(pt.x);
        pt.y = Geometry.numberRound(pt.y);

        if (this.points.length > 0) {
            const pointBefore = this.points[this.points.length - 1];
            if (Math.abs(pt.x - pointBefore.x) < 1 && Math.abs(pt.y - pointBefore.y) < 1)
                return;
        }

        this.points.push(pt);

    }

    async redo(): Promise<void> {
        for (let i = 1; i < this.points.length; i++) {
            Drawing.clearLine(this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].lineWidth);
        }

    }



    getOverviewImage(): string {
        return "url(img/icons/erase.svg)";
    }

    /**
    * 
    * @returns 
    */
    async redoAnimated(): Promise<void> {
        for (let i = 1; i < this.points.length; i++) {
            Drawing.clearLine(this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].lineWidth);
            await Drawing.delay(1);
        }

    }

}