import { ClipPathManager } from './ClipPathManager';
import { Action } from './Action';
import { ActionSerialized } from './ActionSerialized';


/**
 * this action changes the size of a magnet by a given ratio
 * @example ratio = 2: redo will double the size of the magnet while undo while reduce the size by half.
 */
export class ActionMagnetChangeSizeRatio extends Action {

    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetchangesizeratio",
            pause: this.pause, userid: this.userid, magnetid: this.magnetid, ratio: this.ratio
        };
    }


    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param ratio (ratio > 1: increase the size, ratio < 1: decrease the size)
     */
    constructor(userid: string, private readonly magnetid: string, private readonly ratio: number) {
        super(userid);
        this.isDirectlyUndoable = true;
    }


    /**
     * 
     * @param ratio 
     * @description inner function that really performs the change of size (called by redo and undo)
     */
    private magnetChangeSize(ratio: number): void {
        const magnet = document.getElementById(this.magnetid);
        if (!magnet.style.width)
            magnet.style.width = magnet.clientWidth + "px";

        magnet.style.clipPath = ClipPathManager.clipPathChangeSize(magnet.style.clipPath, ratio);
        magnet.style.width = (parseInt(magnet.style.width) * ratio) + "px";
    }


    async redo(): Promise<void> { this.magnetChangeSize(this.ratio); }
    async undo(): Promise<void> { this.magnetChangeSize(1/this.ratio); }

}