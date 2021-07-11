import { Geometry } from './Geometry';
import { ActionSerialized } from './ActionSerialized';
import { Drawing } from './Drawing';
import { Action } from './Action';

/**
 * Action for erasing
 */
export class ActionErase extends Action {
    private svgLinesErased = [];

    setSVGLinesErased(svgLinesErased: SVGLineElement[]): void { this.svgLinesErased = svgLinesErased; }

    get xMax(): number { return Math.max(...this.points.map((p) => p.x)); }

    serializeData(): ActionSerialized {
        return { type: "erase", pause: this.pause, userid: this.userid, points: this.points };
    }

    private points: { x: number; y: number; lineWidth: number }[] = [];

    /**
     * 
     * @param pt 
     * @description add a new point in the path to be erased
     */
    addPoint(pt: { x: number; y: number; lineWidth: number }): void {
        pt.x = Geometry.numberRound(pt.x);
        pt.y = Geometry.numberRound(pt.y);

        if (this.points.length > 0) {
            const lastPoint = this.points[this.points.length - 1];
            if (Math.abs(pt.x - lastPoint.x) < 1 && Math.abs(pt.y - lastPoint.y) < 1)
                return;
        }

        this.points.push(pt);

    }

    async redo(): Promise<void> {
        this.svgLinesErasedErase();
        for (let i = 1; i < this.points.length; i++) {
            Drawing.clearLine(this.points[i - 1].x, this.points[i - 1].y,
                this.points[i].x, this.points[i].y, this.points[i].lineWidth);
        }

    }


    async undo(): Promise<void> { this.svgLinesErasedRestore(); }

    svgLinesErasedRestore(): void { /*nothing*/    }
    
    svgLinesErasedErase(): void {
        for (let i = 0; i < this.points.length; i++) {
            ActionErase.eraseSVG(this.points[i].x, this.points[i].y, this.points[i].lineWidth);
        }
        //this.svgLinesErased.forEach((line) => line.style.visibility = "hidden"); 
    }


    createOverviewImage(): string { return "url(img/icons/erase.svg)"; }

    /**
    * 
    * @returns 
    */
    async redoAnimated(): Promise<void> {
        this.svgLinesErasedErase();
        for (let i = 1; i < this.points.length; i++) {
            Drawing.clearLine(this.points[i - 1].x, this.points[i - 1].y,
                this.points[i].x, this.points[i].y,
                this.points[i].lineWidth);
            if (i % 3 == 0)
                await this.delay();
        }

    }





    static eraseSVG(x: number, y: number, eraseLineWidth: number): void {
        const lines = document.getElementsByTagName("line");

        for (let i = 0; i < lines.length; i++) {
            const svgLine = <SVGLineElement>lines[i];
            const p1 = { x: parseInt(svgLine.getAttributeNS(null, 'x1')), y: parseInt(svgLine.getAttributeNS(null, 'y1')) };
            const p2 = { x: parseInt(svgLine.getAttributeNS(null, 'x2')), y: parseInt(svgLine.getAttributeNS(null, 'y2')) };

            const m = Geometry.middle(p1, p2);
            if (Geometry.distance({ x: x, y: y }, m) < eraseLineWidth) {
                //    this.svgLinesErased.push(svgLine);
                //  svgLine.style.visibility = "hidden";
            }

        }
    }

}