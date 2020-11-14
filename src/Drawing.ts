import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { getCanvas } from './main';
import { Layout } from './Layout';

export class Drawing {

    /**
     *
     * @param points
     * @description clear (erase) the inside of the polygon
     */
    static clearPolygon(points) {
        const canvas = getCanvas();
        const context = canvas.getContext("2d");
        context.save();
        context.beginPath();
        context.moveTo(points[0].x, points[0].y);
        for (let point of points) {
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
    static removeContour(points) {
        const canvas = getCanvas();
        const context = canvas.getContext("2d");
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(255, 255, 255, 1)";
        context.lineWidth = 6;
        context.globalAlpha = 1.0;

        context.moveTo(points[0].x, points[0].y);
        for (let point of points) {
            context.lineTo(point.x, point.y);
        }
        context.stroke();
    }



    static drawLine(context, x1, y1, x2, y2, pressure = 1.0, color = UserManager.me.getCurrentColor()) {
        //console.log(pressure)
        context.beginPath();
        context.strokeStyle = color;
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 0.9 + 0.1 * pressure;
        context.lineWidth = 1.5 + 3 * pressure;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        /*context.moveTo(Math.round(x1), Math.round(y1));
        context.lineTo(Math.round(x2), Math.round(y2));*/
        context.stroke();
        context.closePath();
    }


    static drawDot(x, y, color) {
        const context = getCanvas().getContext("2d");
        context.beginPath();
        context.fillStyle = color;
        context.lineWidth = 2.5;
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fill();
        context.closePath();
    }


    static clearLine(x1, y1, x2, y2, lineWidth = 10) {
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



    static divideScreen() {
        console.log("divide the screen")
        let x = Layout.getXMiddle();
        Drawing.drawLine(getCanvas().getContext("2d"), x, 0, x, Layout.getWindowHeight(), 1, BoardManager.getDefaultChalkColor());
        BoardManager.saveCurrentScreen();
    }

}
