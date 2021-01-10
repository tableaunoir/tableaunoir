import { Action } from './Action';
import { Drawing } from './Drawing';

export class ActionClearZone extends Action {
    serialize(): ActionSerialized {
        return {
            type: "clearzone",
            userid: this.userid,
            points: this.points,
            cut: this.cut,
            removeContour: this.removeContour
        };
    }
    constructor(userid: string, private points: { x: number, y: number }[], private cut: boolean, private removeContour: boolean) {
        super(userid);
    }

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

}