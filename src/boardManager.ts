import { getCanvas, getContainer } from "./main";
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

    static _rightExtendCanvasEnable = true;

    /**
   * initialization (button)
   */
    static init(): void {
        document.getElementById("blackboardClear").onclick = () => {
            Share.execute("boardClear", []);
        }

    }


    static getBackgroundColor(): string {
        return document.getElementById("canvasBackground").style.backgroundColor;
    }

    /**
        * erase the board
        */
    static _clear(): void {
        const canvas = getCanvas();
        canvas.width = canvas.width; //clear
        BoardManager.cancelStack.clear();
    }





    static getDefaultChalkColor(): string {
        return (document.getElementById("canvasBackground").style.backgroundColor == "black") ? "white" : "black";
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
     * @returns the number of pixels when scrolling
     */
    static scrollQuantityHalfPage(): number {
        const THESHOLD = 1500;
        const middle = Layout.getWindowWidth() / 2;
        return Math.min(middle, THESHOLD);
    }


    /**
     * @returns the number of pixels when scrolling
     */
    static scrollQuantity(): number {
        return 100;
    }




    private static _left(x): void {
        if (x < 0) {
            BoardManager.showPageNumber(0);
            return;
        }

        getContainer().scrollTo({ top: 0, left: x, behavior: 'smooth' });
    }







    private static _right(x): void {
        const MAXCANVASWIDTH = 20000;
        const container = getContainer();
        const canvas = getCanvas();
        if (container.scrollLeft >= MAXCANVASWIDTH - Layout.getWindowWidth()) {
            container.scrollLeft = MAXCANVASWIDTH - Layout.getWindowWidth();
            return;
        }

        if ((x >= canvas.width - Layout.getWindowWidth()) && BoardManager._rightExtendCanvasEnable) {
            const image = new Image();
            image.src = canvas.toDataURL();
            console.log("extension: canvas width " + canvas.width + " to " + (container.scrollLeft + Layout.getWindowWidth()))
            canvas.width = ((canvas.width / BoardManager.scrollQuantityHalfPage()) + 1) * BoardManager.scrollQuantityHalfPage();
            const context = canvas.getContext("2d");
            context.globalCompositeOperation = "source-over";
            context.globalAlpha = 1.0;
            image.onload = function () {
                context.drawImage(image, 0, 0);
            }
            BoardManager._rightExtendCanvasEnable = false;
            setTimeout(() => { BoardManager._rightExtendCanvasEnable = true }, 1000);//prevent to extend the canvas too many times
        }

        container.scrollTo({ top: 0, left: x, behavior: 'smooth' });

    }


    /**
     * go left
     */
    static left(): void {
        BoardManager._left(getContainer().scrollLeft - BoardManager.scrollQuantity());
    }


    /**
     * go right (and extend the board if necessary)
     */
    static right(): void {
        const x = getContainer().scrollLeft + BoardManager.scrollQuantity();
        BoardManager._right(x);
    }



    static isCalibratedHalfPage(): boolean {
        return getContainer().scrollLeft % BoardManager.scrollQuantityHalfPage() == 0;
    }

    static correctOnLeft(x) {
        return Math.floor(x / BoardManager.scrollQuantityHalfPage()) * BoardManager.scrollQuantityHalfPage();
    }

    static correctOnRight(x) {
        return Math.ceil((x + 1) / BoardManager.scrollQuantityHalfPage()) * BoardManager.scrollQuantityHalfPage();
    }

    /**
 * go left
 */
    static leftPreviousPage(): void {
        const container = getContainer();
        const xCorrected = BoardManager.isCalibratedHalfPage() ? Math.max(0, container.scrollLeft - BoardManager.scrollQuantityHalfPage()) :
            BoardManager.correctOnLeft(container.scrollLeft);

        BoardManager._left(xCorrected);
        BoardManager.showPageNumber(xCorrected);
    }

    /**
    * go right (and extend the board if necessary)
    */
    static rightNextPage(): void {
        const xCorrected = BoardManager.isCalibratedHalfPage() ? getContainer().scrollLeft + BoardManager.scrollQuantityHalfPage() :
            BoardManager.correctOnRight(getContainer().scrollLeft);
        BoardManager._right(xCorrected);
        BoardManager.showPageNumber(xCorrected);
    }


    static showPageNumber(x: number): void {
        const pageNumber = document.getElementById("pageNumber");
        const canvas = getCanvas();
        const container = getContainer();

        pageNumber.classList.remove("pageNumberHidden");
        pageNumber.classList.remove("pageNumber");
        setTimeout(() => {
            const n = Math.round(x / BoardManager.scrollQuantityHalfPage());
            const total = Math.round(canvas.width / BoardManager.scrollQuantityHalfPage());
            container.scrollLeft = (n) * BoardManager.scrollQuantityHalfPage();
            pageNumber.innerHTML = (n + 1) + "/" + (total); pageNumber.classList.add("pageNumber");
        }, 300)

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
