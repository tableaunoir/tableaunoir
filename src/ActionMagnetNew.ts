import { ActionSerialized } from './ActionSerialized';
import { Action } from "./Action";
import { MagnetManager } from './magnetManager';


export class ActionMagnetNew extends Action {
//    previousMagnet: HTMLElement;
    magnet: HTMLElement;

    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "magnetnew",
            pause: this.pause, userid: this.userid, magnet: this.magnet.outerHTML
        };
    }


    constructor(userid: string, magnet: HTMLElement) {
        super(userid);
        //this.previousMagnet = document.getElementById(this.magnet.id)
        this.magnet = <HTMLElement>magnet.cloneNode(true);
        this.magnet.onclick = magnet.onclick;
        this.isDirectlyUndoable = true;
    }


    getOverviewImage(): string { return "url(img/icons/1F9F2.svg)"; }

    /**
     * 
     * @param magnet 
     * @description change the magnet to be added
     */
    setMagnet(magnet: HTMLElement): void {
        this.magnet = <HTMLElement>magnet.cloneNode(true);
        this.magnet.onclick = magnet.onclick;
    }

    async redo(): Promise<void> {
        const previousElement = document.getElementById(this.magnet.id)
        //if an element with the same id is present, we replace it, so we first remove it
        if (previousElement)
            previousElement.remove();

        this._addMagnet(this.magnet);
        console.trace();
    }



    /**
     * 
     * @param magnet 
     * @description add a copy of the magnet magnet
     */
    private _addMagnet(magnet:HTMLElement) {
        const copyMagnet = <HTMLElement>magnet.cloneNode(true);
        copyMagnet.onclick = magnet.onclick;
        document.getElementById("magnets").appendChild(copyMagnet);
        MagnetManager._installMagnet(copyMagnet);
    }


    async undo(): Promise<void> {
        const previousElement = document.getElementById(this.magnet.id)
        //if an element with the same id is present, we replace it, so we first remove it
        if (previousElement)
            previousElement.remove();
/*
        if(this.previousMagnet) {
            this._addMagnet(this.previousMagnet);
        }*/
        
    }

}