import { getCanvas } from './main';
import { Action } from './Action';

export class ActionModificationCanvas implements Action {
    blobPrevious: Blob;
    blobCurrent: Blob;
    r: { x1: number, y1: number, x2: number, y2: number };

    constructor(blobPrevious: Blob, blobCurrent: Blob, r: { x1: number, y1: number, x2: number, y2: number }) {
        this.blobPrevious = blobPrevious;
        this.blobCurrent = blobCurrent;
        this.r = r;
    }




    static async replaceRectangleImage(blob: Blob | undefined, rectangle: { x1: number, y1: number, x2: number, y2: number }): Promise<void> {
        return new Promise(resolve => {
            const image = new Image();
            const canvas = getCanvas();

            const context = canvas.getContext("2d");
            context.globalCompositeOperation = "source-over";
            context.globalAlpha = 1.0;

            if (blob == undefined) {
                context.clearRect(rectangle.x1, rectangle.y1, rectangle.x2 - rectangle.x1, rectangle.y2 - rectangle.y1);
                resolve();
            }
            else {
                image.onload = function () {
                    canvas.width = image.width;
                    canvas.height = image.height;
                    //context.drawImage(image, 0, 0);
                    context.drawImage(image, rectangle.x1, rectangle.y1, rectangle.x2 - rectangle.x1, rectangle.y2 - rectangle.y1, rectangle.x1, rectangle.y1, rectangle.x2 - rectangle.x1, rectangle.y2 - rectangle.y1);
                    resolve();
                }
                image.src = URL.createObjectURL(blob);
            }
        });
    }



    async undo(): Promise<void> {
        await ActionModificationCanvas.replaceRectangleImage(this.blobPrevious, this.r);
    }
    async redo(): Promise<void> {
        await ActionModificationCanvas.replaceRectangleImage(this.blobCurrent, this.r);
    }

}