import MagnetTextManager from './MagnetTextManager';
import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";
import { MagnetManager } from './magnetManager';


export class ActionMagnetNew extends Action {
    previousMagnet: HTMLElement; // the new magnet is maybe a replacement. We store here the previous magnet.
    magnet: HTMLElement;

    get xMax(): number { return this.magnet.offsetLeft + this.magnet.offsetWidth; }
    get magnetid(): string { return this.magnet.id; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetnew",
            userid: this.userid, magnet: this.magnet.outerHTML
        };
    }


    constructor(userid: string, magnet: HTMLElement) {
        super(userid);
        this.magnet = <HTMLElement>magnet.cloneNode(true);
        this.magnet.onclick = magnet.onclick;
        this.isDirectlyUndoable = true;

        this.previousMagnet = document.getElementById(this.magnet.id);
    }


    createOverviewImage(): string {
        if (MagnetTextManager.isTextMagnet(this.magnet))
            return "url(img/icons/text-svgrepo-com.svg)"; //special icon for text magnet
        else
            return "url(img/icons/1F9F2.svg)";
    }

    /**
     * 
     * @param magnet 
     * @description change the magnet to be added
     */
    setMagnet(magnet: HTMLElement): void {
        this.magnet = <HTMLElement>magnet.cloneNode(true);
        this.magnet.onclick = magnet.onclick;
    }





    /**
     * 
     * @param magnet 
     * @description add a copy of the magnet magnet
     */
    private _addMagnet(magnet: HTMLElement) {
        const copyMagnet = <HTMLElement>magnet.cloneNode(true);
        copyMagnet.onclick = magnet.onclick;
        document.getElementById("magnets").appendChild(copyMagnet);
        MagnetManager._installMagnet(copyMagnet);
    }



    async redo(): Promise<void> {
        const previousElement = document.getElementById(this.magnet.id);
        this.previousMagnet = previousElement;

        if (previousElement) {
            /**
             * if the element to add is already here with exactly the same properties, just do nothing
             * This is important for text magnet! Indeed, if the previousElement would have been removed and replaced,
             * then the text magnet would have lost the focus...
             */
            if (previousElement.isEqualNode(this.magnet))
                return;

            previousElement.remove(); //if an element with the same id is present, we replace it, so we first remove it
        }

        this._addMagnet(this.magnet);
    }



    async undo(): Promise<void> {
        const element = document.getElementById(this.magnet.id)
        if (element)
            element.remove();

        if (this.previousMagnet)
            this._addMagnet(this.previousMagnet);

    }

}