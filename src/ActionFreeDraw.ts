import { ConstraintDrawing } from './ConstraintDrawing';
import { ToolDraw } from './ToolDraw';
import { Geometry } from './Geometry';
import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Action } from './Action';
import { ToolDrawAudio } from './ToolDrawAudio';
import { AnimationManager } from './AnimationManager';
import { ToolDrawOptions } from './ToolDrawOptions';
import { ChalkParticules } from './ChalkParticules';


export class ActionFreeDraw extends Action {
    get xMin(): number { return Math.min(...this.points.map((p) => p.x)); }
    get xMax(): number { return Math.max(...this.points.map((p) => p.x)); }
    get yMin(): number { return Math.min(...this.points.map((p) => p.y)); }
    get yMax(): number { return Math.max(...this.points.map((p) => p.y)); }

    get xMean(): number { return this.points.map((p) => p.x).reduce((partialSum, a) => partialSum + a, 0) / this.points.length; }
    get yMean(): number { return this.points.map((p) => p.y).reduce((partialSum, a) => partialSum + a, 0) / this.points.length; }

    get rect(): { x1: number, y1: number, x2: number, y2: number } {
        return {
            x1: this.xMin, y1: this.yMin,
            x2: this.xMax, y2: this.yMax
        }
    }
    /**
     * 
     * @param magnet1id 
     * @param magnet2id 
     * @param magnet1point 
     * @param magnet2point 
     * @returns says that the drawing is interactive
     */
    setInteractiveGraphInformation(magnet1id: string, magnet2id: string, magnet1point: { x: number, y: number }, magnet2point: { x: number, y: number }): void {
        this.magnet1id = magnet1id;
        this.magnet2id = magnet2id;
        this.magnet1point = magnet1point;
        this.magnet2point = magnet2point;
        this.isDirectlyUndoable = true;
    }


    /**
     * @returns an object iff the freedraw is almost a line
     */
    isAlmostLine(): { angle: number } {
        const thesholdAngle = 0.15; //above it is not a line
        const thesholdDistance = 16; //below the angle is not evaluated
        const first = this.points[0];
        const last = this.points[this.points.length - 1];

        const angle0 = Math.atan2(last.y - first.y, last.x - first.x);

        for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];

            if (Math.abs(point.y - first.y) + Math.abs(point.x - first.x) > thesholdDistance) {
                const angle = Math.atan2(point.y - first.y, point.x - first.x);
                if (Math.abs(angle0 - angle) > thesholdAngle)
                    return undefined;
            }

        }
        return { angle: angle0 };
    }

    serializeData(): ActionSerialized {
        if (this.magnet1id) {
            return {
                type: "freedrawinteractivegraph",
                userid: this.userid,
                points: this.points,
                magnet1id: this.magnet1id,
                magnet2id: this.magnet2id,
                magnet1point: this.magnet1point,
                magnet2point: this.magnet2point
            };
        }
        return { type: "freedraw", userid: this.userid, points: this.points };
    }

    public alreadyDrawnSth = false;
    public points: { x: number; y: number; pressure: number; color: string; }[] = [];
    public magnet1id: string;
    public magnet2id: string;
    public magnet1point: { x: number, y: number };
    public magnet2point: { x: number, y: number };



    /**
     * 
     * @returns true iff the drawing is interactive, i.e. depends on other magnets
     */
    isInteractive(): boolean { return (this.magnet1id != undefined); }



    /**
     * 
     * @param pt 
     * @returns true if the point was indeed added
     */
    addPoint(pt: { x: number; y: number; pressure: number; color: string; }): boolean {
        pt.x = Geometry.numberRound(pt.x);
        pt.y = Geometry.numberRound(pt.y);

        if (this.points.length > 0) {
            const pointBefore = this.points[this.points.length - 1];
            if (Math.abs(pt.x - pointBefore.x) < 1 && Math.abs(pt.y - pointBefore.y) < 1)
                //if the point is too close, we will not add it
                return false;
        }

        this.points.push(pt);
        if (Math.abs(pt.x - this.points[0].x) > 1 || Math.abs(pt.y - this.points[0].y) > 1)
            this.alreadyDrawnSth = true;

        return true;
    }


    svgLines: SVGLineElement[] = undefined;


    private computeSVGLines(): void {
        this.svgLines = [];
        for (let i = 0; i < this.points.length - 1; i++) {
            const a = this.points[i];
            const b = this.points[i + 1];
            this.svgLines.push(ToolDraw.addSVGLine(a.x, a.y, b.x, b.y, a.pressure, a.color));
        }
        this.isDirectlyUndoable = true;
        ConstraintDrawing.freeDraw(this.svgLines, this.magnet1id, this.magnet2id, this.magnet1point, this.magnet2point);
    }

    private smoothifyOnePass() {
        const newpoints: { x: number; y: number; pressure: number; color: string; }[] = [];

        newpoints.push(this.points[0]);
        for (let i = 0; i < this.points.length - 1; i++) {
            const a = this.points[i];
            const b = this.points[i + 1];

            if (Math.abs(a.x - b.x) > 5 || Math.abs(a.y - b.y) > 5) {
                const f = (coeff1, coeff2) => {
                    newpoints.push({
                        x: Geometry.numberRound(coeff1 * a.x + coeff2 * b.x),
                        y: Geometry.numberRound(coeff1 * a.y + coeff2 * b.y),
                        pressure: Geometry.numberRound(coeff1 * a.pressure + coeff2 * b.pressure), color: a.color
                    });
                }
                f(0.85, 0.15);
                f(0.15, 0.85);
            }
            else
                newpoints.push(a);


        }

        newpoints.push(this.points[this.points.length - 1]);

        this.points = newpoints;
    }



    private simplify() {
        function dist2(v: { x: number, y: number }, w: { x: number, y: number }) { return (v.x - w.x) ** 2 + (v.y - w.y) ** 2 }


        /**
         * 
         * @param p 
         * @param v 
         * @param w 
         * @returns the distance of the point p to the segment [vw]
         */
        function perpendicularDistance(p: { x: number, y: number }, v: { x: number, y: number }, w: { x: number, y: number }) {
            const l2 = dist2(v, w);
            if (l2 == 0) return dist2(p, v);
            let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            return dist2(p, {
                x: v.x + t * (w.x - v.x),
                y: v.y + t * (w.y - v.y)
            });
        }

        const EPSILON = 1;

        /**
         * 
         * @param begin 
         * @param end 
         * @returns the simplified polyline between begin and end
         */
        const DouglasPeucker = (begin: number, end: number) => {
            // Find the point with the maximum distance
            let dmax = 0
            let ifar = 0

            for (let i = begin; i < end; i++) {
                const d = perpendicularDistance(this.points[i], this.points[begin], this.points[end]);
                if (d > dmax) {
                    ifar = i;
                    dmax = d;
                }
            }

            if (dmax > EPSILON) {
                const A1 = DouglasPeucker(begin, ifar)
                const A2 = DouglasPeucker(ifar, end);
                return A1.concat(A2.slice(1));
            } else
                return [this.points[begin], this.points[end]];

        }

        this.points = DouglasPeucker(0, this.points.length - 1);

        //fix of the pressure at the end (otherwise there is a weird end in the draw)
        if (this.points.length >= 2)
            this.points[this.points.length - 1].pressure = this.points[this.points.length - 2].pressure;
    }

    
    public postTreatement(): void {
       // console.log("Original: " + this.points.length);
      //  this.smoothifyOnePass();
       // console.log("After smoothing: " + this.points.length);
        this.simplify();
      //  console.log("After simplifying: " + this.points.length);
    }


    getMainColor(): string { return this.points[0].color; }


    async undo(): Promise<void> {
        if (this.isInteractive())
            if (this.svgLines)
                this.svgLines.forEach((line) => line.remove());
    }

    async redo(): Promise<void> {
        if (this.isInteractive()) {
            this.computeSVGLines();
        }
        else {
            if (!this.alreadyDrawnSth)
                Drawing.drawDot(getCanvas().getContext("2d"), this.points[0].x, this.points[0].y, this.points[0].color);

            for (let i = 1; i < this.points.length; i++) {
                Drawing.drawLine(getCanvas().getContext("2d"), this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].pressure, this.points[i].color);
            }
        }


    }





    /**
     * 
     * @returns 
     */
    async redoAnimated(): Promise<void> {
        if (this.isInteractive())
            //if (this.svgLines)
            await this.redo();
        else {
            if (!this.alreadyDrawnSth)
                Drawing.drawDot(getCanvas().getContext("2d"), this.points[0].x, this.points[0].y, this.points[0].color);

            if (AnimationManager.isRunning)
                ToolDrawAudio.mousedown(Math.random() * 0.5 + 0.2);

            for (let i = 1; i < this.points.length; i++) {
                const d = Math.abs(this.points[i - 1].x - this.points[i].x) + Math.abs(this.points[i - 1].y - this.points[i].y);

                if (ToolDrawOptions.isParticules && AnimationManager.isRunning && Math.random() < 0.03 * d)
                    ChalkParticules.start(this.points[i - 1].x, this.points[i - 1].y, this.points[i].pressure, this.points[i].color, 1);

                if (AnimationManager.isRunning)
                    ToolDrawAudio.mousemove(d);

                Drawing.drawLine(getCanvas().getContext("2d"), this.points[i - 1].x, this.points[i - 1].y, this.points[i].x, this.points[i].y, this.points[i].pressure, this.points[i].color);
                await this.delay();
            }
            ToolDrawAudio.mouseup();
        }
    }






    createOverviewImage(): string {
        /**
         * 
         * @returns a clear canvas of the size of the small icon in the animation bar
         */
        function createCanvasOverview(): HTMLCanvasElement {
            const canvas = document.createElement("canvas");
            canvas.width = 24;
            canvas.height = 24;
            return canvas;
        }


        const canvas = createCanvasOverview();
        const ctx = canvas.getContext("2d");
        if (!this.alreadyDrawnSth)
            Drawing.drawDot(ctx, canvas.width / 2, canvas.height / 2, this.points[0].color);

        const xMin = this.xMin;
        const xMax = this.xMax;
        const yMin = this.yMin;
        const yMax = this.yMax;
        const ratioX = (xMax - xMin) < canvas.width ? 1 : canvas.width / (xMax - xMin);
        const ratioY = (yMax - yMin) < canvas.height ? 1 : canvas.height / (yMax - yMin);
        const ratio = Math.min(ratioX, ratioY);
        const x0 = ((xMax - xMin) * ratio < canvas.width) ? (canvas.width - (xMax - xMin) * ratio) / 2 : 0;
        const y0 = ((yMax - yMin) * ratio < canvas.height) ? (canvas.height - (yMax - yMin) * ratio) / 2 : 0;
        const scaleX = (x: number) => x0 + (x - xMin) * ratio;
        const scaleY = (y: number) => y0 + (y - yMin) * ratio;

        for (let i = 1; i < this.points.length; i++) {
            Drawing.drawLine(ctx,
                scaleX(this.points[i - 1].x), scaleY(this.points[i - 1].y),
                scaleX(this.points[i].x), scaleY(this.points[i].y), this.points[i].pressure * ratio, this.points[i].color);
        }
        return "url(" + canvas.toDataURL() + ")";
    }





    get contour() {
        return this.points;
    }
}