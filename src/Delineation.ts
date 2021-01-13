import { Sound } from './Sound';
import { ActionClearZone } from './ActionClearZone';
import { UserManager } from './UserManager';
import { Drawing } from './Drawing';
import { BoardManager } from './boardManager';
import { getCanvas } from './main';
import { MagnetManager } from './magnetManager';


/**
 * This class represents a polyline drawn by a user
 */
export class Delineation {

    points: { x: number, y: number }[] = [];
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



    addPoint(point: { x, y }): void {
        this.points.push(point);
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
    static inPolygon(point: { x: number, y: number }, polygon: { x: number, y: number }[]): boolean {
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


    /**
     * @param cut, removeContour
     * @description magnetize the "selected" part of the blackboard.
     * 
     * If cut is true: the selected part is also removed.
     * If removeContour is true: the contour will not be part of the magnet
     */
    magnetize(userid: string, cut: boolean, removeContour: boolean): void {
        if (!this.isSuitable())
            return;

        if (removeContour)
            Drawing.removeContour(this.points);

        if (userid == UserManager.me.userID) //only the real user will create the magnet since the others will receive it
            this._createMagnetFromImg();

        Sound.play("magnetcreationfromboard");
        
        if (cut && removeContour) //if cut, remove the contour after having baked the magnet
            Drawing.removeContour(this.points);

        if (cut)
            Drawing.clearPolygon(this.points);

        //the code above can not beexecuted bythe action because the magnet has to be created
        const action = new ActionClearZone(userid, this.points, cut, removeContour);
        BoardManager.addAction(action);
        this.reset();
    }



    isSuitable(): boolean {
        for (const point of this.points) {
            if (Math.abs(point.x - this.points[0].x) > 16 &&
                Math.abs(point.x - this.points[0].x) > 16)
                return true;
        }
        return false;
    }


    /**
     * @returns the smallest rectangle that surrounds the points
     */
    _getRectangle(): { x1: number, y1: number, x2: number, y2: number } {
        const canvas = getCanvas();
        const r = { x1: canvas.width, y1: canvas.height, x2: 0, y2: 0 };
        const PAD = 2;

        for (const point of this.points) {
            r.x1 = Math.min(r.x1, point.x - PAD);
            r.y1 = Math.min(r.y1, point.y - PAD);
            r.x2 = Math.max(r.x2, point.x + PAD);
            r.y2 = Math.max(r.y2, point.y + PAD);
        }

        return r;
    }




    _createMagnetFromImg: () => void = () => {
        const img = new Image();
        const rectangle = this._getRectangle();
        console.log(rectangle)
        img.src = BoardManager.getDataURLOfRectangle(rectangle);
        img.style.clipPath = "polygon(" + this.points.map(point => `${point.x - rectangle.x1}px ${point.y - rectangle.y1}px`).join(", ") + ")";
        MagnetManager.addMagnet(img);
        img.style.left = rectangle.x1 + "px";
        img.style.top = rectangle.y1 + "px";
    }

}
