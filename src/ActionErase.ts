import { Drawing } from './Drawing';
import { Action } from './Action';

export class ActionErase extends Action {

    private points: { x: number; y: number; lineWidth: number }[] = [];

    addPoint(pt: { x: number; y: number; lineWidth: number }): void {
        this.points.push(pt);

    }

    async redo(): Promise<void> {
        for (let i = 1; i < this.points.length; i++) {
            Drawing.clearLine(this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].lineWidth);
        }

    }

}