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
import { ActionRectangle } from './ActionRectangle';
import { ActionEllipse } from './ActionEllipse';


/**
 * This class represents a polyline drawn by a user
 */
export class Magnetizer {


    /**
     * 
     * @param userid 
     * @returns true if the last action added in the timeline by the user userid
     * is ok for magnetisation
     */
    static isSuitableForMagnetisation(userid: string): boolean {
        const iaction = BoardManager.timeline.getIndexLastActionByUser(userid);
        return Magnetizer.isActionSuitableForMagnetisation(BoardManager.timeline.actions[iaction]);
    }


    /**
     * @param cut
     * @description magnetize the "selected" part of the blackboard. Do nothing if nothing has to be magnetize
     * 
     * If cut is true: the selected part is also removed.
     */
    static magnetize(userid: string, cut: boolean): void {
        const iaction = BoardManager.timeline.getIndexLastActionByUser(userid);
        console.log(`order to magnetize from action n°${iaction} from user ${userid}`);

        //TODO: take the last action from userid and analysize it! actions[iaction]
        if (!Magnetizer.isActionSuitableForMagnetisation(BoardManager.timeline.actions[iaction]))
            return;

        Sound.play("magnetcreationfromboard");

        /**
         * the magnet id is common to all. That is why it is computed here. (it would be bad if each client computes its own magnet id!)
         */
        const magnetid = MagnetManager.generateID();
        const op = new OperationMagnetize(userid, iaction, cut, magnetid);

        if (userid == UserManager.me.userID)
            BoardManager.executeOperation(op);
        else
            op.redo();

    }



    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param iaction 
     * @param cut 
     * @description This function is called from a SharedEvent, called by OperationMagnetize
     * 
     */
    static async performMagnetize(userid: string, magnetid: string, iaction: number, cut: boolean) {
        console.log(`order to magnetize from action n°${iaction} from user ${userid}`);
        const actionContour = <ActionFreeDraw | ActionRectangle | ActionEllipse>BoardManager.timeline.actions[iaction];
        await BoardManager.timeline.deleteAction(iaction);
        const magnet = Magnetizer.createMagnetFromCanvas(userid, magnetid, actionContour.contour);

        if (cut) {
            const action = new ActionClearZone(userid, actionContour.contour);
            BoardManager.timeline.insertActionNowAlreadyExecuted(action, true);
        }

        MagnetManager.currentMagnet = magnet;
        magnet.classList.add("magnet");
        BoardManager.timeline.insertActionNowAlreadyExecuted(new ActionMagnetNew(userid, magnet));
    }


    /**
     * 
     * @param userid 
     * @param iaction 
     * @param cut 
     * @param previousContourAction 
     * @description This function is called from a SharedEvent, called by OperationMagnetize
     */
    static async undoMagnetize(userid: string, iaction: number, cut: boolean, previousContourAction: Action) {
        if (cut)
            await BoardManager.timeline.deleteActions([iaction, iaction + 1]); //delete the cleaning of the zone + the magnet creation
        else
            await BoardManager.timeline.deleteActions([iaction]); //delete the magnet creation

        BoardManager.timeline.insertAction(previousContourAction, iaction);
    }

    /**
     * @returns true iff 
     * either the action is a rectangle, an ellipse,
     * or the free draw that can be magnetized (the surface is not too small)
     * TODO: to be improved. Make that a polygon with intersection cannot be magnetized
     */
    static isActionSuitableForMagnetisation(action: Action): boolean {

        function isSufficientlyBig(points: { x: number, y: number }[]): boolean {
            for (const point of points) {
                if (Math.abs(point.x - points[0].x) > 16 &&
                    Math.abs(point.y - points[0].y) > 16)
                    return true;
            }
            return false;

        }

        if (!(action instanceof ActionFreeDraw || action instanceof ActionRectangle || action instanceof ActionEllipse))
            return false;

        if (action instanceof ActionFreeDraw) {
            if (action.isInteractive())
                return false;

            return isSufficientlyBig(action.contour);

        }

        return true;
    }






    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param points 
     * @returns a magnet (not added to the magnet layer yet) that contains the image of what is on the canvas in the polygon
     * defined by the points
     * the magnet id is magnetid (the magnet id is fixed from outside because it is shared by all the board)
     */
    static createMagnetFromCanvas(userid: string, magnetid: string, points: { x: number, y: number }[]): HTMLImageElement {


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
