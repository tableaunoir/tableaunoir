import { ActionSerialized } from './ActionSerialized';
import { getCanvas } from "./main";
import { Action } from "./Action";


/**
 * for backward compatibility
 */
export class ActionInit extends Action {
    get xMax(): number {
        if (this.img)
            return this.img.width;
        else return 0;
    }

    private img = undefined;
    constructor(userid: string, private canvasDataURL: string) {
        super(userid);
        if (canvasDataURL) {
            this.img = new Image();
            this.img.src = canvasDataURL;
        }

    }

    serializeData(): ActionSerialized {
        return { type: "init",  userid: this.userid, canvasDataURL: this.canvasDataURL };
    }

    createOverviewImage(): string { return "url(img/icons/start.svg)"; }

    redo(): Promise<void> {
        return new Promise((resolve) => {
            if (this.img) {
                const drawAndResolve = () => {
                    const canvas = getCanvas();
                    canvas.width = Math.max(canvas.width, this.img.width);
                    canvas.height = Math.max(canvas.height, this.img.height);
                    canvas.getContext("2d").drawImage(this.img, 0, 0);
                    resolve();
                }

                if (this.img.height != 0) {
                    //                    console.log("image is already loaded: " + this.img.height);
                    drawAndResolve();
                }
                else
                    this.img.onload = drawAndResolve;

                //              console.log("action init: redo")
            }
            else
                resolve();
        });

    }

}