import { getCanvas } from "./main";
import { Share } from "./share";
import { Layout } from './Layout';
import { CancelStack } from './cancelStack';

/**
 * Manage the board
 */
export class BoardManager {

    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    static boardName = "0";

    /** stack to store the cancel/redo actions */
    static cancelStack = new CancelStack();


    /**
   * initialization (button)
   */
    static init(): void {
        document.getElementById("blackboardClear").onclick = () => {
            Share.execute("boardClear", []);
        }

    }


    /**
        * erase the board
        */
    static _clear(): void {
        const canvas = getCanvas();
        canvas.width = canvas.width; //clear
        BoardManager.cancelStack.clear();
    }








    static _createCanvasForRectangle(r: { x1: number, y1: number, x2: number, y2: number }): HTMLCanvasElement {
        const C = document.createElement("canvas");
        C.width = r.x2 - r.x1;
        C.height = r.y2 - r.y1;
        const ctx = C.getContext("2d");
        ctx.drawImage(getCanvas(),
            r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1, //coordinates in the canvas
            0, 0, r.x2 - r.x1, r.y2 - r.y1); //coordinates in the magnet
        return C;
    }


    /**
     *
     * @param {*} r a rectangle {x1, y1, x2, y2}
     * @description call the callback when the blob of the rectangle is created
     */
    static _toBlobOfRectangle(r: { x1: number, y1: number, x2: number, y2: number }, callback: BlobCallback): void {
        BoardManager._createCanvasForRectangle(r).toBlob(callback);
    }



    /**
  *
  * @param {*} r a rectangle {x1, y1, x2, y2}
  * @returns the content as a string of the image
  */
    static getDataURLOfRectangle(r: { x1: number, y1: number, x2: number, y2: number }): string {
        return BoardManager._createCanvasForRectangle(r).toDataURL();
    }



    /**
     * save the current board into the cancel/redo stack but also in the localStorage of the browser
     */
    static save(rectangle: { x1: number, y1: number, x2: number, y2: number } | undefined): void {
        const canvas = getCanvas();
        if (rectangle == undefined)
            rectangle = { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height };

        canvas.toBlob((blob) => {
            console.log("save that blob: " + blob)
            //  localStorage.setItem(Share.getTableauNoirID(), canvas.toDataURL());
            rectangle = { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height };
            BoardManager.cancelStack.push({ x1: rectangle.x1, y1: rectangle.y1, x2: rectangle.x2, y2: rectangle.y2, blob: blob });
            //Share.sendFullCanvas(blob);
        });

    }




    static getCurrentScreenRectangle(): { x1: number, y1: number, x2: number, y2: number } {
        const container = document.getElementById("container");
        const x1 = container.scrollLeft;
        const y1 = container.scrollTop;
        const x2 = x1 + Layout.getWindowWidth();
        const y2 = y1 + Layout.getWindowHeight();
        return { x1: x1, y1: y1, x2: x2, y2: y2 };
    }

    static saveCurrentScreen(): void {
        BoardManager.save({ x1: Layout.getWindowLeft(), y1: 0, x2: Layout.getWindowRight(), y2: Layout.getWindowHeight() });
    }

    /**
     * load the board from the local storage
     */
    static load(data = localStorage.getItem(Share.getTableauNoirID())): void {
        // let data = localStorage.getItem(BoardManager.boardName);

        if (data != undefined) {
            BoardManager._clear();
            try {
                const image = new Image();
                image.src = data;
                image.onload = function () {
                    const canvas = getCanvas();
                    canvas.width = image.width;
                    canvas.height = image.height;
                    canvas.getContext("2d").drawImage(image, 0, 0);
                    BoardManager.save(undefined);
                    console.log("loaded!")
                }
            }
            catch (e) {
                //TODO: handle error?
            }

        }
        else {
            BoardManager._clear();
            BoardManager.save(undefined);
        }

    }




    /**
     * load the board from the local storage
     */
    static loadWithoutSave(data = localStorage.getItem(BoardManager.boardName)): void {
        // let data = localStorage.getItem(BoardManager.boardName);

        if (data != undefined) {
            BoardManager._clear();
            const image = new Image();
            image.src = data;
            image.onload = function () {
                const canvas = getCanvas();
                canvas.width = image.width;
                canvas.height = image.height;
                canvas.getContext("2d").drawImage(image, 0, 0);
                console.log("loaded!")
            }
        }
        else {
            BoardManager._clear();
        }

    }







  

    /**
     *
     * @param {*} level
     */
    static _loadCurrentCancellationStackData(data: CanvasModificationRectangle, rectangle: CanvasModificationRectangle): void {
        const image = new Image();
        const canvas = getCanvas();

        const context = canvas.getContext("2d");
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1.0;

        //  if (data instanceof Blob) {
        image.src = URL.createObjectURL(data.blob);
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            //context.drawImage(image, 0, 0);
            context.drawImage(image, rectangle.x1, rectangle.y1, rectangle.x2 - rectangle.x1, rectangle.y2 - rectangle.y1,
                rectangle.x1, rectangle.y1, rectangle.x2 - rectangle.x1, rectangle.y2 - rectangle.y1);
        }
        /*  }
          else {
              console.log("_loadCurrentCancellationStackData with rectangle at " + data.x1)
              image.src = URL.createObjectURL(data.blob);
              image.onload = function () {
                  context.clearRect(data.x1, data.y1, data.x2 - data.x1, data.y2 - data.y1);
                  context.drawImage(image, data.x1, data.y1);
              }
          }*/ //still bugy


    }

    /**
     *
     */
    static cancel(): void {
        const top = BoardManager.cancelStack.top();
        const previous = BoardManager.cancelStack.back();
        BoardManager._loadCurrentCancellationStackData(previous, top);

    }



    /**
     *
     */
    static redo(): void {
        const c = BoardManager.cancelStack.forward();
        BoardManager._loadCurrentCancellationStackData(c, c);

    }
}
