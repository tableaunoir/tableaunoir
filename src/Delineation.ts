import { Sound } from './Sound';
import { ActionClearZone } from './ActionClearZone';
import { UserManager } from './UserManager';
import { BoardManager } from './boardManager';
import { getCanvas } from './main';
import { MagnetManager } from './magnetManager';
import { OperationMagnetize } from './OperationMagnetize';
import { ActionFreeDraw } from './ActionFreeDraw';
import { Action } from './Action';
import { ActionMagnetNew } from './ActionMagnetNew';


/**
 * This class represents a polyline drawn by a user
 */
export class Delineation {

    //TODO: delete all this points thing... it should be computed directly from the Action themselves

    setPoints(points: { x: number; y: number }[]): void {
        this.points = points;
    }

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
     * @param cut
     * @description magnetize the "selected" part of the blackboard.
     * 
     * If cut is true: the selected part is also removed.
     */
    magnetize(userid: string, cut: boolean): void {
        const iaction = BoardManager.timeline.getIndexLastActionByUser(userid);
        console.log(`order to magnetize from action n°${iaction} from user ${userid}`);

        //TODO: take the last action from userid and analysize it! actions[iaction]
        if (!this.isSuitableForMagnetisation())
            return;

        Sound.play("magnetcreationfromboard");


        const op = new OperationMagnetize(userid, iaction, cut, MagnetManager.generateID());

        if (userid == UserManager.me.userID)
            BoardManager.executeOperation(op);
        else
            op.redo();

        /*
    this.performMagnetize(userid, iaction, cut);*/
    }






    /**
        performMagnetize(userid: string, iaction: number, cut: boolean) {
            const actionContour = <ActionFreeDraw>BoardManager.timeline.actions[iaction];
    
            BoardManager.deleteAction(iaction).then(() => {
                this._createMagnetFromImg(userid);
    
                if (cut) {
                    const action = new ActionClearZone(userid, actionContour.points);
                    BoardManager.addAction(action);
                }
                this.reset();
    
            });
        }
     */



    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param iaction 
     * @param cut 
     * @description This function is called from a SharedEvent, called by OperationMagnetize
     * 
     */
    async performMagnetize(userid: string, magnetid: string, iaction: number, cut: boolean) {
        console.log(`order to magnetize from action n°${iaction} from user ${userid}`);
        const actionContour = <ActionFreeDraw>BoardManager.timeline.actions[iaction];
        await BoardManager.timeline.deleteAction(iaction);
        const magnet = this._createMagnetFromImg(userid, magnetid, actionContour.points);

        if (cut) {
            const action = new ActionClearZone(userid, actionContour.points);
            BoardManager.timeline.insertActionNowAlreadyExecuted(action, true);
        }

        MagnetManager.currentMagnet = magnet;
        magnet.classList.add("magnet");
        BoardManager.timeline.insertActionNowAlreadyExecuted(new ActionMagnetNew(userid, magnet));

        this.reset();

    }



    async undoMagnetize(userid: string, iaction: number, cut: boolean, previousContourAction: Action) {
        if (cut)
            await BoardManager.timeline.deleteActions([iaction, iaction + 1]);
        else
            await BoardManager.timeline.deleteActions([iaction]);

        BoardManager.timeline.insertAction(previousContourAction, iaction);
    }

    /**
     * @returns true iff the delineation can be magnetized (the surface is not too small)
     * TODO: to be improved. Make that a polygon with intersection cannot be magnetized
     */
    isSuitableForMagnetisation(): boolean {
        for (const point of this.points) {
            if (Math.abs(point.x - this.points[0].x) > 16 &&
                Math.abs(point.y - this.points[0].y) > 16)
                return true;
        }
        return false;
    }






    /**
     * remark: only the current user will create the magnet (the other users will receive it)
     */
    _createMagnetFromImg(userid: string, magnetid: string, points): HTMLImageElement {


        /**
         * @returns the smallest rectangle that surrounds the points
         */
        function _getRectangle(points): { x1: number, y1: number, x2: number, y2: number } {
            const canvas = getCanvas();
            const r = { x1: canvas.width, y1: canvas.height, x2: 0, y2: 0 };
            const PAD = 2;

            for (const point of points) {
                r.x1 = Math.min(r.x1, point.x - PAD);
                r.y1 = Math.min(r.y1, point.y - PAD);
                r.x2 = Math.max(r.x2, point.x + PAD);
                r.y2 = Math.max(r.y2, point.y + PAD);
            }

            return r;
        }

        const img = new Image();
        img.id = magnetid;
        const rectangle = _getRectangle(points);
        img.src = BoardManager.getDataURLOfRectangle(rectangle);
        img.style.clipPath = "polygon(" + points.map(point => `${point.x - rectangle.x1}px ${point.y - rectangle.y1}px`).join(", ") + ")";
        img.style.left = rectangle.x1 + "px";
        img.style.top = rectangle.y1 + "px";
        return img;


        //TODO: create an action for that
    }

}
