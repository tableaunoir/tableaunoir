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

    private static patterns = {};
    static createChalkPatternCanvas(color: string): HTMLCanvasElement {
        const patternCanvas = document.createElement('canvas');
        const context = patternCanvas.getContext('2d');

        const size = 128;
        patternCanvas.width = size;
        patternCanvas.height = size;
        const lineWidth = 2;
        context.fillStyle = color;

        for (let i = 0; i < size * size / 20; i++) {
            const x = size * Math.random();
            const y = size * Math.random();

            const shiftForChalkEffectDrawing = 0.65;
            context.globalAlpha = Math.random() * 0.5;
            context.fillRect(x + (-lineWidth + Math.random() - shiftForChalkEffectDrawing) * context.lineWidth,
                y + (- lineWidth + Math.random() - shiftForChalkEffectDrawing) * context.lineWidth,
                2 * lineWidth * shiftForChalkEffectDrawing * (1 + Math.random()),
                2 * lineWidth * shiftForChalkEffectDrawing * (1 + Math.random()));

            const shiftForChalkEffectClear = 0.35;
            context.clearRect(x + (- lineWidth + Math.random() - shiftForChalkEffectClear) * context.lineWidth,
                y + (- lineWidth + Math.random() - shiftForChalkEffectClear) * context.lineWidth,
                2 * lineWidth * shiftForChalkEffectClear * (1 + Math.random()),
                2 * lineWidth * shiftForChalkEffectClear * (1 + Math.random()));
        }

        return patternCanvas;
    }



    static getChalkPatternCanvas(color: string): HTMLCanvasElement {
        if (Drawing.patterns[color] == undefined)
            Drawing.patterns[color] = Drawing.createChalkPatternCanvas(color);
        return Drawing.patterns[color];
    }

    static fill(ctx: CanvasRenderingContext2D, points: { x: number; y: number; }[], color: string): void {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++)
            ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        if (Drawing.isChalkEffect)
            ctx.fillStyle = ctx.createPattern(Drawing.getChalkPatternCanvas(color), "repeat");
        else {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = color;
        }

        ctx.fill();
    }



    static lineWidth: number;
    private static isChalkEffect = false;
    private static isEraserEffect = false;



    static init(): void {
        OptionManager.number({
            name: "lineWidth",
            defaultValue: 1.5,
            onChange: (lineWidth) => {
                this.lineWidth = lineWidth;
                Drawing.clear();
                BoardManager.timeline.canvasRedraw();
            }

        });

        OptionManager.boolean({
            name: "chalkEffect",
            defaultValue: false,
            onChange: (s) => {
                Drawing.isChalkEffect = s;
                Drawing.clear();
                BoardManager.timeline.canvasRedraw();
            }
        });

        OptionManager.boolean({
            name: "eraserEffect",
            defaultValue: false,
            onChange: (s) => {
                Drawing.isEraserEffect = s;
                Drawing.clear();
                BoardManager.timeline.canvasRedraw();
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

            const STEP = 4;//8
            for (let i = 0; i < dist; i += STEP) {
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
            const nbPixels = 64; //nb of pixels in the sample
            let maxAlpha = 0;
            for (let j = 0; j < nbPixels; j++) {
                const i = Math.floor(Math.random() * pixels.length / 4);
                if (pixels[4 * i + 3] > 0) {
                    n += pixels[4 * i + 3]; //sum of alpha channel (one solid pixel counts for 255)
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
                a = Math.min(0.4, maxAlpha * 0.4 / 255, 255 * n / (nbPixels * 255));
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
