import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";


/**
 * @description
 * action that put the magnet to the background if it is in the foreground and
 * put the magnet to the foreground if it is in the background
 * 
 * foreground: the user can move the magnet
 * background: the magnet is behind the board so that the user can draw over the magnet
 */
export class ActionMagnetSwitchBackgroundForeground extends Action {
    readonly magnetid: string;
    readonly points: { x: number; y: number; }[] = [];


    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetswitchbackgroundforeground",
             userid: this.userid, magnetid: this.magnetid
        };
    }


    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param points a NON-EMPTY list of points
     */
    constructor(userid: string, magnetid: string) {
        super(userid);
        this.magnetid = magnetid;
        this.isDirectlyUndoable = true;
    }

    createOverviewImage(): string { return "url(img/icons/magnetMove.svg)"; }

    do(): void {
        const m = document.getElementById(this.magnetid);
        const z = -parseInt(m.style.zIndex); //new value for zIndex

        /** animations */
        m.classList.remove("magnetToForeground");
        m.classList.remove("magnetToBackground");
        if (z < 0)
            m.classList.add("magnetToBackground");
        else
            m.classList.add("magnetToForeground");

        m.style.zIndex = z + "";
    }

    /** switching between back/foreground is an involution */
    async redo(): Promise<void> { this.do(); }
    async undo(): Promise<void> { this.do(); }


}