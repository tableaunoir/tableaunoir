import { UserManager } from './UserManager';
import { getCanvas } from './main';


/**
 * low level functions for drawing on the canvas
 */
export class DrawingCanvas {

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
        context.beginPath();
        context.strokeStyle = color;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 0.9 + 0.1 * pressure;
        context.lineWidth = this.lineWidth * (1 + 2 * pressure);
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        //context.closePath();

        /****** Chalk effect (too slow in real time!) ***/
       /* context.fillStyle = color;
        const dist = Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
        for (let i = 0; i < dist; i += 2) {
            const x = x1 + (i * (x2 - x1) / dist);
            const y = y1 + (i * (y2 - y1) / dist);
            context.globalAlpha = 1;
            context.fillRect(x + (Math.random() - 0.5) * context.lineWidth, y + (Math.random() - 0.5) * context.lineWidth,
                1+Math.random(), 1+Math.random());
        }
        context.closePath();*/
    }



    static clear() : void {
        const canvas = getCanvas();
        //canvas.width = canvas.width + 0;
        const context = canvas.getContext("2d");        
        context.clearRect(0, 0, canvas.width, canvas.height);
    
    }


    
    static drawLineUndo(context: CanvasRenderingContext2D,
        x1: number, y1: number, x2: number, y2: number,
        pressure = 1.0): void {
        //console.log(pressure)
        context.beginPath();
        context.strokeStyle = "rgba(255,255,255,1)";
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 0.9 + 0.1 * pressure;
        context.lineWidth = this.lineWidth * (1 + 2 * pressure);
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
        context.closePath();
    }


    static drawDot(context: CanvasRenderingContext2D,x: number, y: number, color: string): void {
        context.beginPath();
        context.fillStyle = color;
        context.lineWidth = this.lineWidth * 2;
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fill();
      //  context.closePath();
    }


    static clearLine(x1: number, y1: number, x2: number, y2: number, lineWidth = 10): void {
        const context = getCanvas().getContext("2d");
        context.beginPath();
        //context.strokeStyle = BACKGROUND_COLOR;
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(255,255,255,1)";

        context.lineWidth = lineWidth;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineCap = "round";
        context.stroke();
      //  context.closePath();
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
