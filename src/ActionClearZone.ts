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
            points: this.points
        };
    }


    /**
     * @param userid id of the user
     * @param points points of the polygon
     * @param cut, true iff the inside of the polygon is removed
     * @param removeContour, true iff the contour (the lines of the polygon itself) is removed
     */
    constructor(userid: string, private points: { x: number, y: number }[]) { super(userid); }

    async redo(): Promise<void> {
            Drawing.clearPolygon(this.points);

    }


    createOverviewImage(): string { return "url(img/icons/erase.svg)"; }

}