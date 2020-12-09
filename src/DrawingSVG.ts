import { BlackVSWhiteBoard } from './BlackVSWhiteBoard';
import { OptionManager } from './OptionManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { getCanvas } from './main';
import { Layout } from './Layout';



/**
 * this class is HIGHLY experimental... :)
 */
export class DrawingSVG {

    static lineWidth: number;


    /**
     *
     * @param points
     * @description clear (erase) the inside of the polygon
     */
    static clearPolygon(points: { x: number, y: number }[]): void {
        const canvas = getCanvas();
        const context = canvas.getContext("2d");
        context.save();
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (const point of points) {
            context.lineTo(point.x, point.y);
        }
        context.clip();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();
        context.globalCompositeOperation = "source-over";

    }


    /**
     * 
     * @param points 
     * @description erase the contour of the polygon
     */
    static removeContour(points: { x: number, y: number }[]): void {
        const canvas = getCanvas();
        const context = canvas.getContext("2d");
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(255, 255, 255, 1)";
        context.lineWidth = 6;
        context.globalAlpha = 1.0;

        context.moveTo(points[0].x, points[0].y);
        for (const point of points) {
            context.lineTo(point.x, point.y);
        }
        context.stroke();
    }



    static drawLine(context: CanvasRenderingContext2D,
        x1: number, y1: number, x2: number, y2: number,
        pressure = 1.0, color: string = UserManager.me.getCurrentColor()): void {

        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGLineElement>document.createElementNS(svgns, 'line');

        shape.setAttributeNS(null, 'x1', "" + x1);
        shape.setAttributeNS(null, 'y1', "" + y1);
        shape.setAttributeNS(null, 'x2', "" + (x2));
        shape.setAttributeNS(null, 'y2', "" + (y2));
        shape.setAttributeNS(null, 'stroke', color);
        shape.setAttributeNS(null, 'stroke-width', ""+this.lineWidth * (1 + 2 * pressure));
        document.getElementById("svg").appendChild(shape);
        context.stroke();
        context.closePath();
    }


    static drawDot(x: number, y: number, color: string): void {
        const context = getCanvas().getContext("2d");
        context.beginPath();
        context.fillStyle = color;
        context.lineWidth = this.lineWidth * 2;
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    }


    static clearLine(x1: number, y1: number, x2: number, y2: number, lineWidth = 10): void {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGLineElement>document.createElementNS(svgns, 'line');

        shape.setAttributeNS(null, 'x1', "" + x1);
        shape.setAttributeNS(null, 'y1', "" + y1);
        shape.setAttributeNS(null, 'x2', "" + (x2));
        shape.setAttributeNS(null, 'y2', "" + (y2));
        shape.setAttributeNS(null, 'stroke',  "black");
        shape.setAttributeNS(null, 'stroke-width', ""+lineWidth);
        document.getElementById("svg").appendChild(shape);
    }


    static drawRectangle({ x1, y1, x2, y2 }: { x1: number, y1: number, x2: number, y2: number }, color: string): void {
        const context = getCanvas().getContext("2d");
        context.beginPath();
        context.strokeStyle = color;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
        context.lineWidth = this.lineWidth;
        context.rect(x1, y1, x2 - x1, y2 - y1);
        context.stroke();
    }



    static drawEllipse({ cx, cy, rx, ry }: { cx: number, cy: number, rx: number, ry: number }, color: string): void {
        const context = getCanvas().getContext("2d");
        context.beginPath();
        context.strokeStyle = color;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1;
        context.lineWidth = this.lineWidth;
        context.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI, false);
        context.stroke();
    }



}
