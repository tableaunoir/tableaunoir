import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Action } from './Action';

export class ActionFreeDraw extends Action {
    public alreadyDrawnSth = false;
    public points: { x: number; y: number; pressure: number; color: string; }[] = [];

    addPoint(pt: { x: number; y: number; pressure: number; color: string; }): void {
        this.points.push(pt);
        if (Math.abs(pt.x - this.points[0].x) > 1 || Math.abs(pt.y - this.points[0].y) > 1)
            this.alreadyDrawnSth = true;
    }


    smoothify(): void {
        const newpoints: { x: number; y: number; pressure: number; color: string; }[] = [];

        newpoints.push(this.points[0]);
        for (let i = 0; i < this.points.length - 1; i++) {
            const a = this.points[i];
            const b = this.points[i + 1];

            newpoints.push({ x: 0.85 * a.x + 0.15 * b.x, y: 0.85 * a.y + 0.15 * b.y, pressure: a.pressure, color: a.color });
            newpoints.push({ x: 0.15 * a.x + 0.85 * b.x, y: 0.15 * a.y + 0.85 * b.y, pressure: a.pressure, color: a.color });
        }

        newpoints.push(this.points[this.points.length - 1]);

        this.points = newpoints;
    }



    async redo(): Promise<void> {
        if (!this.alreadyDrawnSth)
            Drawing.drawDot(this.points[0].x, this.points[0].y, this.points[0].color);

        for (let i = 1; i < this.points.length; i++) {
            Drawing.drawLine(getCanvas().getContext("2d"), this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].pressure, this.points[i].color);
        }

    }

}