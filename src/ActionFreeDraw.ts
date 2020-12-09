import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Action } from './Action';

export class ActionFreeDraw implements Action {

    private points: { x: number; y: number; pressure: number; color: string; }[] = [];

    addPoint(pt: { x: number; y: number; pressure: number; color: string; }) {
        this.points.push(pt);
    }

    async redo(): Promise<void> {
        for (let i = 1; i < this.points.length; i++) {
            Drawing.drawLine(getCanvas().getContext("2d"), this.points[i-1].x,  this.points[i-1].y,  this.points[i].x, this.points[i].y, this.points[i].pressure, this.points[i].color);
        }
        
    }

}