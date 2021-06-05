import { ConstraintDrawing } from './ConstraintDrawing';
import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";



export class ActionMagnetDelete extends Action {
    readonly magnetid: string;



    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetdelete",
            pause: this.pause, userid: this.userid, magnetid: this.magnetid
        };
    }


    constructor(userid: string, magnetid: string) {
        super(userid);
        this.magnetid = magnetid;
    }


    async redo(): Promise<void> {
        const element = document.getElementById(this.magnetid);
        if (element) {
            element.remove();
            ConstraintDrawing.update();
        }

    }
}