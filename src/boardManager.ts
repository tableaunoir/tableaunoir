import { ActionClear } from './ActionClear';
import { UserManager } from './UserManager';
import { OperationAddAction } from './OperationAddAction';
import { CancelStack } from './CancelStack';
import { ActionMagnetDelete } from './ActionMagnetDelete';
import { ActionMagnetNew } from './ActionMagnetNew';
import { MagnetManager } from './magnetManager';
import { AnimationToolBar } from './AnimationToolBar';
import { getCanvas } from "./main";
import { Share } from "./share";
import { Layout } from './Layout';
import { Timeline } from './Timeline';
import { Action } from './Action';
import { ActionMagnetMove } from './ActionMagnetMove';
import { Operation } from 'Operation';
import { AnimationManager } from './AnimationManager';


/**
 * Manage the board
 */
export class BoardManager {

    static readonly MAGNETCANCELLABLE = true;

    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    static boardName = "0";

    /** timeline of actions */
    static timeline = new Timeline();

    /** stack to store the cancel/redo operations */
    static cancelStack = new CancelStack();

    /**
   * initialization (button)
   */
    static init(): void {
        document.getElementById("blackboardClear").onclick = () => {
            Share.execute("boardReset", []);
        }

    }


    /**
    * erase the board
    */
    static _reset(): void {
        const canvas = getCanvas();
        canvas.width = canvas.width + 0; //clear
        BoardManager.timeline.clear();
        BoardManager.cancelStack = new CancelStack();
    }

    /**
     * 
     * @param atLeastWidth 
     * @description makes that the canvas.width is at least Width
     */
    static setWidthAtLeast(atLeastWidth: number): void {
        const canvas = getCanvas();
        canvas.width = atLeastWidth;
        BoardManager.timeline.canvasRedraw();
    }




    /**
     * @param a rectangle r 
     * @returns a canvas of width r.x2 - r.x1 and height r.y2 - r.y1 containing the content of the canvas
     */
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
     * 
     * @param action 
     * @description add an action (and performs it!)
     */
    static addAction(action: Action): void {
        if (!BoardManager.MAGNETCANCELLABLE)
            if (action instanceof ActionMagnetNew ||
                action instanceof ActionMagnetMove ||
                action instanceof ActionMagnetDelete
            )
                return;
        const operation = new OperationAddAction(action, BoardManager.timeline.getCurrentIndex() + 1);
        //BoardManager.cancelStack.updateTimeSteps((ts) => ts >= BoardManager.timeline.getCurrentIndex()+1 ? ts+1 : ts);
        //add it to the cancel stack only if the action was performed by me! (I will be able to cancel directly only *my* actions)
        if (action.userid == UserManager.me.userID)
            BoardManager.cancelStack.push(operation);

        BoardManager.timeline.insertNowAlreadyExecuted(action);
        AnimationToolBar.update();
    }


    static executeOperation(operation: Operation): void {
        operation.redo();
        BoardManager.cancelStack.push(operation);
    }


    static getLastAction(): Action {
        return BoardManager.timeline.getLastAction();
    }


    static getCurrentScreenRectangle(): { x1: number, y1: number, x2: number, y2: number } {
        const container = document.getElementById("container");
        const x1 = container.scrollLeft;
        const y1 = container.scrollTop;
        const x2 = x1 + Layout.getWindowWidth();
        const y2 = y1 + Layout.getWindowHeight();
        return { x1: x1, y1: y1, x2: x2, y2: y2 };
    }



    /**
     * load the board from the local storage
     */
    static load(data = localStorage.getItem(Share.getTableauNoirID())): void {
        // let data = localStorage.getItem(BoardManager.boardName);

        if (data != undefined) {
            try {
                BoardManager.timeline.clearAndReset(data);
            }
            catch (e) {
                //TODO: handle error?
            }
        }
        else {
            BoardManager._reset();
        }

    }




    /**
     *
     */
    static async cancel(userid: string): Promise<void> {
        if (!BoardManager.cancelStack.canUndo())
            return;

        BoardManager.cancelStack.undo();
        AnimationToolBar.update();
    }



    /**
     *
     */
    static async redo(userid: string): Promise<void> {
        if (!BoardManager.cancelStack.canRedo())
            return;

        BoardManager.cancelStack.redo();
        AnimationToolBar.update();
    }



    static async previousPausedFrame(): Promise<void> {
        AnimationManager.end();
        await BoardManager.timeline.previousPausedFrame();
        AnimationToolBar.update();
    }

    static async nextPausedFrame(): Promise<void> {
        if (AnimationManager.isRunning)
            AnimationManager.end();
        else {
            AnimationManager.begin();
            await BoardManager.timeline.nextPausedFrame();
            AnimationManager.end();
            AnimationToolBar.update();
        }

    }



    private static get widthFromActions(): number { return Math.max(...this.timeline.actions.map((a) => a.xMax)); }
    private static get widthFromMagnets(): number {
        const magnets = MagnetManager.getMagnets();
        let max = 0;
        for (let i = 0; i < magnets.length; i++)
            max = Math.max(max, magnets[i].offsetLeft + magnets[i].offsetWidth);
        return max;
    }


    /**
     * 
     * @param userid 
     * @description declare the last action as a "pause" (meaning it ends a "slide")
     * and then clear the board
     */
    static newSlideAndClear(userid: string): void {
        BoardManager.timeline.getLastAction().pause = true;
        document.getElementById("content").style.filter = "invert(0.5)";
        BoardManager.addAction(new ActionClear(userid));
        setTimeout(() => document.getElementById("content").style.filter = "", 100);
    }



    static get width(): number { return Math.max(BoardManager.widthFromActions, BoardManager.widthFromMagnets); }
}


window["BoardManager"] = BoardManager;