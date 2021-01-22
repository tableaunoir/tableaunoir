import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from './Action';

/**
 * Action for erasing
 */
export class ActionErase extends Action {
    serialize(): ActionSerialized {
        return { type: "erase", userid: this.userid, points: this.points };
    }

    private points: { x: number; y: number; lineWidth: number }[] = [];

    /**
     * 
     * @param pt 
     * @description add a new point in the path to be erased
     */
    addPoint(pt: { x: number; y: number; lineWidth: number }): void {
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

}