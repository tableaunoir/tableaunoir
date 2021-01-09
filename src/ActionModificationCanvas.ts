import { getCanvas } from './main';
import { Action } from './Action';


/** can be replaced by a cut action */
export class ActionModificationCanvas extends Action {

    serialize(): Object {
        return {
            type: "blit", imagesrc: this.image.src,
            x1: this.r.x1, y1: this.r.y1, x2: this.r.x2, y2: this.r.y2
        };
    }


    private readonly image = new Image();

    /**
     * 
     * @param blobCurrent of the rectangle
     * @param r 
     * @description adds a modification of the canvas located in the rectangle r.
     */
    constructor(userid: string, private readonly blobAfter: Blob, private readonly r: { x1: number, y1: number, x2: number, y2: number }) {
        super(userid);
        this.image.src = URL.createObjectURL(this.blobAfter);
    }





    async redo(): Promise<void> {
        return new Promise(resolve => {
            const f = () => {
                const canvas = getCanvas();
                const context = canvas.getContext("2d");
                context.globalCompositeOperation = "source-over";
                context.globalAlpha = 1.0;
                context.clearRect(this.r.x1, this.r.y1, this.r.x2 - this.r.x1, this.r.y2 - this.r.y1);
                context.drawImage(this.image, this.r.x1, this.r.y1);
                resolve();
            }

            if (this.image.complete)
                f();
            this.image.onload = f;

        });
    }

}