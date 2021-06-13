import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";
import { MagnetManager } from './magnetManager';


export class ActionMagnetNew extends Action {
    readonly magnet: HTMLElement;

    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetnew",
            pause: this.pause, userid: this.userid, magnet: this.magnet.outerHTML
        };
    }


    constructor(userid: string, magnet: HTMLElement) {
        super(userid);
        this.magnet = <HTMLElement>magnet.cloneNode(true);
        this.magnet.onclick = magnet.onclick;
    }


    getOverviewImage(): string { return "url(img/icons/1F9F2.svg)"; }

    async redo(): Promise<void> {
        const previousElement = document.getElementById(this.magnet.id)

        //if an element with the same id is present, we replace it, so we first remove it
        if (previousElement)
            previousElement.remove();

        const magnet = <HTMLElement>this.magnet.cloneNode(true);
        magnet.onclick = this.magnet.onclick;
        document.getElementById("magnets").appendChild(magnet);
        MagnetManager._installMagnet(magnet);
    }
}