import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";
import { ShowMessage } from './ShowMessage';


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
    readonly destination: number; // positive => goto foreground; negative => goto background

    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetswitchbackgroundforeground",
            userid: this.userid, magnetid: this.magnetid,
            destination: this.destination
        };
    }


    /**
     * 
     * @param userid 
     * @param magnetid 
     * @param destination (if positive => to foreground, if negative => to background)
     */
    constructor(userid: string, magnetid: string, destination: number) {
        super(userid);
        this.magnetid = magnetid;
        this.destination = destination;
        this.isDirectlyUndoable = true;
    }

    createOverviewImage(): string { return "url(img/icons/magnetMove.svg)"; }


    do(destination: number): void {
        console.log(this.magnetid)
        const m = document.getElementById(this.magnetid);

        if (m.style.zIndex == "")
            m.style.zIndex = "1";
        const z = parseInt(m.style.zIndex); //new value for zIndex

        if (z * destination > 0) //same side (all in the foregrounds or all in the background)
            return;

        /** animations */
        m.classList.remove("magnetToForeground");
        m.classList.remove("magnetToBackground");
        
        if (destination < 0) 
            m.classList.add("magnetToBackground");
        else
            m.classList.add("magnetToForeground");

        m.style.zIndex = (-z) + "";

        if (!(destination * parseInt(m.style.zIndex) > 0)) {
            ShowMessage.error("errur in switching background and foreground");
            console.trace(`action magnet switch : ${destination} and ${z} and ${m.style.zIndex}`);
        }
    }

    async redo(): Promise<void> { this.do(this.destination); }
    async undo(): Promise<void> { this.do(-this.destination); }


}