import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Action } from './Action';

export class ActionFreeDraw implements Action {
    public alreadyDrawnSth = false;
    private points: { x: number; y: number; pressure: number; color: string; }[] = [];

    addPoint(pt: { x: number; y: number; pressure: number; color: string; }) {
        this.points.push(pt);
        if (Math.abs(pt.x - this.points[0].x) > 1 || Math.abs(pt.y - this.points[0].y) > 1)
            this.alreadyDrawnSth = true;
    }

    async redo(): Promise<void> {
        if (!this.alreadyDrawnSth)
            Drawing.drawDot(this.points[0].x, this.points[0].y, this.points[0].color);

        for (let i = 1; i < this.points.length; i++) {
            Drawing.drawLine(getCanvas().getContext("2d"), this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].pressure, this.points[i].color);
        }

    }

}