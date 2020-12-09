import { Drawing } from './Drawing';
import { Action } from './Action';

/**
 * Action for erasing
 */
export class ActionErase extends Action {

    private points: { x: number; y: number; lineWidth: number }[] = [];

    /**
     * 
     * @param pt 
     * @description add a new point in the path to be erased
     */
    addPoint(pt: { x: number; y: number; lineWidth: number }): void {
        this.points.push(pt);

    }

    async redo(): Promise<void> {
        for (let i = 1; i < this.points.length; i++) {
            Drawing.clearLine(this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].lineWidth);
        }

    }

}f