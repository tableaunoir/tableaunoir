import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";



export class ActionMagnetDelete extends Action {
    readonly magnetid: string;
    readonly magnet: HTMLElement;


    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetdelete",
            userid: this.userid, magnetid: this.magnetid
        };
    }


    constructor(userid: string, magnetid: string) {
        super(userid);
        this.magnetid = magnetid;
        this.isDirectlyUndoable = true;
    }

    createOverviewImage(): string { return "url(img/icons/E262.svg)"; }



    /**
     * 
     * @description undo the deletion, i.e. add again the magnet
     */
    async undo(): Promise<void> {
        const element = document.getElementById(this.magnetid)

        if (element)
            element.style.visibility = "visible";

    }



    /**
     * perform the deletion of the magnet
     */
    async redo(): Promise<void> {
        const element = document.getElementById(this.magnetid);

        if (element)
            element.style.visibility = "hidden";

    }
}