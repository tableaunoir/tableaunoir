import { getCanvas } from "./main";
import { Action } from "./Action";


export class ActionInit extends Action {

    private img = undefined;
    constructor(userid: string, private canvasDataURL: string) {
        super(userid);
        if (canvasDataURL) {
            this.img = new Image();
            this.img.src = canvasDataURL;
        }

    }

    serialize(): ActionSerialized {
        return { type: "init", userid: this.userid, canvasDataURL: this.canvasDataURL };
    }

    redo(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.img) {
                const f = () => {
                    const canvas = getCanvas();
                    canvas.width = Math.max(canvas.width, this.img.width);
                    canvas.height = Math.max(canvas.height, this.img.height);
                    canvas.getContext("2d").drawImage(this.img, 0, 0);
                    resolve();
                }

                this.img.onload = f;
                if (this.img.complete)
                    f();

                console.log("action init: redo")
            }
            else
                resolve();
        });

    }

}