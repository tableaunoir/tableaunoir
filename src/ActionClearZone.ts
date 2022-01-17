import { ActionSerialized } from './ActionSerialized';
import { Action } from './Action';
import { Drawing } from './Drawing';


/**
 * @description Action that clears a polygon zone
 * 
 */
export class ActionClearZone extends Action {

    get xMax(): number { return Math.max(...this.points.map((p) => p.x)); }

    serializeData(): ActionSerialized {
        return {
            type: "clearzone",            
            userid: this.userid,
            points: this.points,
            cut: this.cut,
            removeContour: this.removeContour
        };
    }


    /**
     * @param userid id of the user
     * @param points points of the polygon
     * @param cut, true iff the inside of the polygon is removed
     * @param removeContour, true iff the contour (the lines of the polygon itself) is removed
     */
    constructor(userid: string, private points: { x: number, y: number }[], private cut: boolean, private removeContour: boolean) { super(userid); }

    async redo(): Promise<void> {
        if (this.removeContour)
            Drawing.removeContour(this.points);

        /*if (userid != UserManager.me.userID) //only the real user will create the magnet since the others will receive it
            this._createMagnetFromImg();*/

        if (this.cut && this.removeContour) //if cut, remove the contour after having baked the magnet
            Drawing.removeContour(this.points);

        if (this.cut)
            Drawing.clearPolygon(this.points);

    }


    createOverviewImage(): string { return "url(img/icons/erase.svg)"; }

}