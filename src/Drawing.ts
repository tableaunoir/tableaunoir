import { BackgroundTexture } from './BackgroundTexture';
import { OptionManager } from './OptionManager';
import { BoardManager } from './boardManager';
import { Layout } from './Layout';
import { ActionFreeDraw } from './ActionFreeDraw';
import { getCanvas } from './main';
import { UserManager } from './UserManager';


/**
 * general drawing class with low level functions for drawing on the canvas
 */
export class Drawing {

    static lineWidth: number;
    private static isChalkEffect = false;
    private static isEraserEffect = false;



    static init(): void {
        OptionManager.number({
            name: "lineWidth",
            defaultValue: 1.5,
            onChange: (lineWidth) => this.lineWidth = lineWidth
        });

        OptionManager.boolean({
            name: "chalkEffect",
            defaultValue: false,
            onChange: (s) => {
                Drawing.isChalkEffect = s;
            }
        });

        OptionManager.boolean({
            name: "eraserEffect",
            defaultValue: false,
            onChange: (s) => {
                Drawing.isEraserEffect = s;
            }
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
        if (Drawing.isChalkEffect) {
            context.fillStyle = color;
            context.globalAlpha = 1;
            const dist = Math.round(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));

            for (let i = 0; i < dist; i += 8) {
                const x = x1 + (i * (x2 - x1) / dist);
                const y = y1 + (i * (y2 - y1) / dist);

                const shiftForChalkEffectClear = 0.35;
                context.clearRect(x + (Math.random() - shiftForChalkEffectClear) * context.lineWidth,
                    y + (Math.random() - shiftForChalkEffectClear) * context.lineWidth,
                    2 * shiftForChalkEffectClear * (1 + Math.random()),
                    2 * shiftForChalkEffectClear * (1 + Math.random()));

                const shiftForChalkEffectDrawing = 0.35;
                context.fillRect(x + (Math.random() - shiftForChalkEffectDrawing) * context.lineWidth,
                    y + (Math.random() - shiftForChalkEffectDrawing) * context.lineWidth,
                    2 * shiftForChalkEffectDrawing * (1 + Math.random()),
                    2 * shiftForChalkEffectDrawing * (1 + Math.random()));
            }
        }

    }


    /**
     * @description clear the canvas
     */
    static clear(): void {
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


    static drawDot(context: CanvasRenderingContext2D, x: number, y: number, color: string): void {
        context.beginPath();
        context.fillStyle = color;
        context.lineWidth = this.lineWidth * 2;
        context.arc(x, y, 2, 0, 2 * Math.PI);
        context.fill();
        //  context.closePath();
    }


    static clearLine(x1: number, y1: number, x2: number, y2: number, lineWidth = 10): void {
        

        const context = getCanvas().getContext("2d");
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;

        const lineWidth2 = Math.floor(lineWidth / 2);
        if (Drawing.isEraserEffect) {
            let n = 0;
            const pixels = context.getImageData(x1 - lineWidth2, y1 - lineWidth2, lineWidth, lineWidth).data;
            const nbPixels = 6;
            let maxAlpha = 0;
            for (let j = 0; j < nbPixels; j++) {
                const i = Math.floor(Math.random() * pixels.length / 4);
                if (pixels[4 * i + 3] > 0) {
                    n += pixels[4 * i + 3];
                    r += pixels[4 * i];
                    g += pixels[4 * i + 1];
                    b += pixels[4 * i + 2];

                    maxAlpha = Math.max(pixels[4 * i + 3], maxAlpha);
                }
            }

            if (n > 0) {
                const seuil = (x: number) => (Math.min(255, x / nbPixels));
                r = seuil(r);
                g = seuil(g);
                b = seuil(b);
                a = Math.min(0.5, maxAlpha * 0.7 / 255, 255 * n / (nbPixels * 255));
            }

        }

        context.beginPath();
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = `rgba(${255},${255},${255},${0.9})`;
        context.lineWidth = lineWidth;
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.lineCap = "round";
        context.stroke();
        //  context.closePath();

        if (Drawing.isEraserEffect) {
            context.beginPath();
            context.globalCompositeOperation = "source-over";
            context.strokeStyle = `rgba(${r},${g},${b},${a})`;

            context.lineWidth = lineWidth;
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.lineCap = "round";
            context.stroke();
        }
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







    static divideScreen(userid: string, x: number): void {
        console.log("divide the screen")
        const action = new ActionFreeDraw(userid);
        action.addPoint({ x: x, y: 0, pressure: 1, color: BackgroundTexture.getDefaultChalkColor() });
        action.addPoint({ x: x, y: Layout.getWindowHeight(), pressure: 1, color: BackgroundTexture.getDefaultChalkColor() });
        action.redo();
        BoardManager.addAction(action);
    }



}
