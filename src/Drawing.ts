import { BlackVSWhiteBoard } from './BlackVSWhiteBoard';
import { OptionManager } from './OptionManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { getCanvas } from './main';
import { Layout } from './Layout';

export class Drawing {

    static lineWidth: number;


    static init(): void {
        OptionManager.number({
            name: "lineWidth",
            defaultValue: 1.5,
            onChange: (lineWidth) => this.lineWidth = lineWidth
        });
    }
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
        //console.log(pressure)
        context.beginPath();
        context.strokeStyle = color;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 0.9 + 0.1 * pressure;
        context.lineWidth = this.lineWidth * (1 + 2 * pressure);
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        /*context.bezierCurveTo(
            x1 + (x2 - x1) / 2,
            y1,
            x1,
            y1 + (y2 - y1) / 2,
            x2,
            y2);*/
        /*context.moveTo(Math.round(x1), Math.round(y1));
        context.lineTo(Math.round(x2), Math.round(y2));*/
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
        context.closePath();
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


    static divideScreen(): void {
        console.log("divide the screen")
        const x = Layout.getXMiddle();
        Drawing.drawLine(getCanvas().getContext("2d"), x, 0, x, Layout.getWindowHeight(), 1,
            BlackVSWhiteBoard.getDefaultChalkColor());
        BoardManager.saveCurrentScreen();
    }

}
