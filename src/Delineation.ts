import { BoardManager } from './boardManager';
import { getCanvas } from './main';
import { MagnetManager } from './magnetManager';
import { Share } from './share';

/**
 * This class represents a polyline drawn by a user
 */
export class Delineation {

    points = [];
    lastpoints = [];
    drawing: boolean;
    maybeJustAPoint = true; //memoisation for getDot


    reset(): void {
        this.drawing = true;
        this.lastpoints = this.points;
        this.points = [];
        this.maybeJustAPoint = true;
    }

    finish(): void {
        this.drawing = false;
        this.removePolygon();
    }
    /**
     * @returns true if the set of current points is non-empty
     */
    isDrawing(): boolean {
        return this.points.length > 0;
    }

    containsPolygonToMagnetize(): boolean {
        return this.points.length > 0;
    }

    drawPolygon(points): void {
        if (document.getElementById("magnetCreationPolygon"))
            return;

        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.id = "magnetCreationPolygon";
        document.getElementById("svg").appendChild(polyline);

        points.push(points[0]);
        polyline.setAttribute("points", points.map((p) => p.x + ", " + p.y).join(" "));
    }

    removePolygon(): void {
        if (document.getElementById("magnetCreationPolygon"))
            document.getElementById("svg").removeChild(document.getElementById("magnetCreationPolygon"));
    }


    addPoint(point): void {
        this.points.push(point);

        if (this.isDot() && this.dotInPreviousPolygon()) {
            this.drawPolygon(this.lastpoints);

            window.setTimeout(() => {
                if (this.drawing && this.isDot() && this.dotInPreviousPolygon()) {
                    this.removePolygon();
                    Share.execute("removeContour", [this.points]); //remove the dot
                    this.points = this.lastpoints;
                    this.lastpoints = [];
                    this.cutAndMagnetize();
                }
            }, 1000);
        }
        else
            this.removePolygon();

    }

    /**
     * @returns true if the current drawing is just a point
     */
    isDot(): boolean {
        if (!this.maybeJustAPoint)
            return false;
        if (this.points.length == 0)
            return false;

        for (const point of this.points)
            if (Math.abs(point.x - this.points[0].x) > 2 && Math.abs(point.y - this.points[0].y) > 2) {
                this.maybeJustAPoint = false;
                return false;
            }

        return true;
    }

    /**
     *
     * @param {*} point
     * @param {*} polygon
     * @returns true iff the point is inside the polygon
     */
    static inPolygon(point, polygon): boolean {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

        const x = point.x, y = point.y;

        let inside = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    dotInPreviousPolygon(): boolean {
        return Delineation.inPolygon(this.points[0], this.lastpoints);
    }

    erase(): void {
        if (!this.isSuitable())
            return;

        Share.execute("removeContour", [this.points]);
        Share.execute("clearPolygon", [this.points]);
        this.reset();
        BoardManager.save();
    }


    /**
     * @description magnetize the "selected" part of the blackboard. The selected part is also removed.
     */
    cutAndMagnetize(): void {
        if (!this.isSuitable())
            return;

        Share.execute("removeContour", [this.points]);
        this._createMagnetFromImg();
        Share.execute("clearPolygon", [this.points]);
        this.reset();
        BoardManager.save();
    }


    /**
    * @description magnetize the "selected" part of the blackboard.
    */
    copyAndMagnetize(): void {
        if (!this.isSuitable())
            return;

        Share.execute("removeContour", [this.points]);
        this._createMagnetFromImg();
        BoardManager.save();
    }




    isSuitable(): boolean {
        for (const point of this.points) {
            if (Math.abs(point.x - this.points[0].x) > 16 &&
                Math.abs(point.x - this.points[0].x) > 16)
                return true;
        }
        return false;
    }


    _getRectangle() {
        const canvas = getCanvas();
        const r = { x1: canvas.width, y1: canvas.height, x2: 0, y2: 0 };

        for (const point of this.points) {
            r.x1 = Math.min(r.x1, point.x);
            r.y1 = Math.min(r.y1, point.y);
            r.x2 = Math.max(r.x2, point.x);
            r.y2 = Math.max(r.y2, point.y);
        }

        return r;
    }




    _createMagnetFromImg = () => {
        const img = new Image();
        const rectangle = this._getRectangle();
        console.log(rectangle)
        //BoardManager._toBlobOfRectangle(rectangle, (blob) => img.src = URL.createObjectURL(blob));
        img.src = BoardManager.getDataURLOfRectangle(rectangle);
        img.style.clipPath = "polygon(" + this.points.map(point => `${point.x - rectangle.x1}px ${point.y - rectangle.y1}px`).join(", ") + ")";
        MagnetManager.addMagnet(img);
        img.style.left = rectangle.x1 + "px";
        img.style.top = rectangle.y1 + "px";
    }

}
