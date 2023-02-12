import { OperationDeleteSeveralActions } from './OperationDeleteSeveralActions';
import { ActionSlideStart } from './ActionSlideStart';
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
import { Operation } from './Operation';
import { AnimationManager } from './AnimationManager';
import { OptionManager } from './OptionManager';
import { ActionClearZone } from './ActionClearZone';
import { ActionPrintMagnet } from './ActionPrintMagnet';
import { ClipPathManager } from './ClipPathManager';
import { ActionFreeDraw } from './ActionFreeDraw';
import { OperationTranslate } from './OperationTranslate';


/**
 * Manage the board
 */
export class BoardManager {
    static setTimeLineCurrentIndex(t: number): void {
        BoardManager.timeline.setCurrentIndex(t);
        BoardManager.updateSlideNumber();

    }

    static readonly MAGNETCANCELLABLE = true;

    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    static boardName = "0";

    /** timeline of actions */
    static timeline = new Timeline();

    /** stack to store the cancel/redo operations */
    static cancelStack = new CancelStack();

    static isSlideNumber = true;
    /**
   * initialization (button)
   */
    static init(): void {
        document.getElementById("blackboardClear").onclick = () => {
            if (confirm("Do you want to clear and reset the board?"))
                Share.execute("boardReset", []);
        }

        OptionManager.boolean({
            name: "presentationSlideNumber",
            defaultValue: true,
            onChange: (b) => {
                BoardManager.isSlideNumber = b;
                BoardManager.updateSlideNumber();
            }
        });


    }


    /**
    * erase the board, reset the cancel stack everything. The board will be EMPTY.
    */
    static reset(): void {

        const canvas = getCanvas();
        canvas.width = canvas.width + 0; //clear the board
        MagnetManager.resetMagnets(); // clear the magnets

        BoardManager.timeline.clear();
        BoardManager.cancelStack = new CancelStack();

        AnimationToolBar.update();
    }

    /**
     * 
     * @param atLeastWidth 
     * @description makes that the canvas.width is at least Width
     */
    static setWidthAtLeast(atLeastWidth: number): void {
        const canvas = getCanvas();
        if (canvas.width < atLeastWidth) {
            canvas.width = atLeastWidth;
            BoardManager.timeline.canvasRedraw();
        }

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
     * @param iaction 
     * @description delete the action iaction. We also register the deletion of the action in the cancelStack for the good user
     */
    static async deleteAction(iaction: number): Promise<void> {
        const operation = new OperationDeleteSeveralActions([iaction]);

        if (BoardManager.timeline.actions[iaction].userid == UserManager.me.userID)
            BoardManager.cancelStack.push(operation);

        await operation.redo();
    }
    /**
     * 
     * @param action 
     * @param executeAgain: true means that we execute the action again if it is the moment to execute it (if false, we just add it and it assumed the action was just performed)
     * @description add an action (and performs it!). We also register that action in the cancelStack for the good user
     */
    static addAction(action: Action, executeAgain = true): void {
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

        BoardManager.setWidthAtLeast(action.xMax);

        BoardManager.timeline.insertActionNowAlreadyExecuted(action, executeAgain);
        //AnimationToolBar.update();

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
     * load the board from the local storage (a bit deprecated, corresponds to the previous Tableaunoir format with a bitmap)
     */
    static load(canvasDataURL: string): void {
        try {
            BoardManager.timeline.clearAndReset(canvasDataURL);
        }
        catch (e) {
            //TODO: handle error?
        }
    }




    /**
     *
     */
    static async cancel(userid: string): Promise<void> {
        if (!BoardManager.cancelStack.canUndo())
            return;

        BoardManager.cancelStack.undo();
        BoardManager.updateSlideNumber();
    }



    /**
     *
     */
    static async redo(userid: string): Promise<void> {
        if (!BoardManager.cancelStack.canRedo())
            return;

        BoardManager.cancelStack.redo();
        BoardManager.updateSlideNumber();
    }



    static async previousPausedFrame(): Promise<void> {
        AnimationManager.end();
        await BoardManager.timeline.previousPausedFrame();
        AnimationToolBar.updateCurrentIndex();
        BoardManager.updateSlideNumber();
    }

    /**
     * @decription go the next slide by executing the animation
     */
    static async nextPausedFrame(): Promise<void> {
        if (AnimationManager.isRunning) {
            AnimationManager.end();
            BoardManager.updateSlideNumber();
        }
        else {
            BoardManager.updateSlideNumber(1);
            AnimationManager.begin();
            await BoardManager.timeline.nextPausedFrame();
            AnimationManager.end();
            AnimationToolBar.updateCurrentIndex();
            BoardManager.updateSlideNumber();
        }

    }


    /**
     * 
     * @param shift 
     * @description update the slide number in the bottom right corner (+shift to the slide number)
     */
    private static updateSlideNumber(shift = 0): void {
        const slideNumberElement = document.getElementById("slideNumber");
        if (BoardManager.timeline.isSeveralSlides()) {
            slideNumberElement.hidden = !BoardManager.isSlideNumber;
            slideNumberElement.innerHTML = "" + (BoardManager.timeline.getSlideNumber() + shift);
        }
        else
            slideNumberElement.hidden = true;
    }


    static async previousFrame(): Promise<void> {
        AnimationManager.end();
        await BoardManager.timeline.previousFrame();
        AnimationToolBar.updateCurrentIndex();
    }

    static async nextFrame(): Promise<void> {
        AnimationManager.end();
        await BoardManager.timeline.nextFrame();
        AnimationToolBar.updateCurrentIndex();
    }

    /**
     * @description go the next slide (instantly)
     */
    static fastNextPausedFrame(): void {
        AnimationManager.end();
        BoardManager.timeline.nextPausedFrame();
        AnimationToolBar.updateCurrentIndex();
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
     * @description ad a pause action (i.e. make a new slide)
     * and then clear the board
     */
    static newSlideAndClear(userid: string): void {
        BoardManager.addAction(new ActionSlideStart(userid));
        BoardManager.updateSlideNumber();
        document.getElementById("content").style.filter = "invert(0.5)";
        BoardManager.addAction(new ActionClear(userid));
        setTimeout(() => document.getElementById("content").style.filter = "", 100);
    }

    /**
     * 
     * @param userid 
     * @description add a pause action for making a new slide
     */
    static newSlide(userid: string): void {
        BoardManager.addAction(new ActionSlideStart(userid));
        BoardManager.updateSlideNumber();
        document.getElementById("content").style.filter = "invert(0.5)";
        setTimeout(() => document.getElementById("content").style.filter = "", 100);
    }

    /**
 * 
 * @param userid 
 * @description remove the next pause action for merging the current slide with the next one
 */
    static mergeSlide(userid: string): void {
        const nextNewSlideActionIndex = BoardManager.timeline.getNextNewSlideActionIndex();
        console.log("merge: remove action of index " + nextNewSlideActionIndex);
        if (nextNewSlideActionIndex)
            BoardManager.executeOperation(new OperationDeleteSeveralActions([nextNewSlideActionIndex]));
    }

    static get width(): number {
        console.log(BoardManager.widthFromActions)
        return Math.max(BoardManager.widthFromActions, BoardManager.widthFromMagnets);
    }


    /**
     * 
     * @param userid 
     * @description we "simplify" the timeline by removing redundant animation steps
     */
    static forgetAnimation(userid: string): void {
        const timeline = BoardManager.timeline;
        const t = timeline.getCurrentIndex();
        const tbegin = timeline.getPreviousSlideLastFrame() + 1;

        const indicesSuchThat = (array, i: number, j: number, predicate) => {
            const result = [];
            for (let k = i; k <= j; k++) {
                if (predicate(array[k], k))
                    result.push(k);
            }
            return result;
        }

        const firstIndexSuchThat = (array, i: number, j: number, predicate) => {
            for (let k = i; k <= j; k++) {
                if (predicate(array[k], k))
                    return k;
            }
            return undefined;
        }

        console.log(`tbegin = ${tbegin}, t = ${t}`)


        /**
         * check for CLEAR ZONE NEW MAGNET (of that zone) ......... MAGNETPRINT (of that magnet)
         * ==> move what has been drawn in the clear zone.
         */
        if (t > tbegin) {
            if (tbegin == 0 || timeline.actions[tbegin + 1] instanceof ActionClear) {
                console.log("good slide")
                for (let j = tbegin; j <= t - 4; j++) {
                    const actionMagnetClearZone = timeline.actions[j];
                    const actionMagnetNew = timeline.actions[j + 1];

                    if (actionMagnetClearZone instanceof ActionClearZone &&
                        actionMagnetNew instanceof ActionMagnetNew) {
                        const magnetid = actionMagnetNew.magnetid;
                        const polygon = actionMagnetClearZone.points;
                        console.log("recognize maybe a translation");

                        const iPrint = firstIndexSuchThat(timeline.actions, j, t, (a) =>
                            a instanceof ActionPrintMagnet && a.magnet.id == magnetid);

                        if (iPrint) {

                            const actionPrintMagnet = timeline.actions[iPrint];

                            const iMove = indicesSuchThat(timeline.actions, j, iPrint, (a) =>
                                a instanceof ActionMagnetMove && a.magnetid == magnetid);

                            const mx = parseInt(actionMagnetNew.magnet.style.left);
                            const my = parseInt(actionMagnetNew.magnet.style.top);
                            if (ClipPathManager.almostSameListOfPoints(
                                ClipPathManager.clipPathToPoints(actionMagnetNew.magnet.style.clipPath)
                                    .map((p) => ({ x: p.x + mx, y: p.y + my })), polygon)
                            ) {

                                console.log("recognize translation");
                                const i = indicesSuchThat(timeline.actions, tbegin, j, (a) => {
                                    if (a instanceof ActionFreeDraw)
                                        return a.points.every((p) => ClipPathManager.isInsidePolygon(p, polygon))
                                    else
                                        return false;

                                });

                                let vector: { x: number, y: number };

                                if (iMove.length == 0)
                                    vector = { x: 0, y: 0 }
                                else {
                                    const actionMagnetMoveFirst = <ActionMagnetMove>timeline.actions[iMove[0]];
                                    const actionMagnetMoveLast = <ActionMagnetMove>timeline.actions[iMove[iMove.length - 1]];

                                    vector = {
                                        x: actionMagnetMoveLast.points[actionMagnetMoveLast.points.length - 1].x
                                            - actionMagnetMoveFirst.points[0].x,
                                        y: actionMagnetMoveLast.points[actionMagnetMoveLast.points.length - 1].y
                                            - actionMagnetMoveFirst.points[0].y
                                    };

                                }

                                BoardManager.executeOperation(new OperationDeleteSeveralActions([j, iPrint]));
                                BoardManager.executeOperation(new OperationTranslate(i, vector));

                                this.forgetAnimation(userid);
                                return;
                            }
                        }
                    }
                }
            }
        }



        /**
         * MAGNETNEW .... MAGNETMOVE ... MAGNETMOVE... => MAGNETNEW with last position as the new position
         */
        for (const j of indicesSuchThat(timeline.actions, tbegin, t, (a) => a instanceof ActionMagnetNew)) {
            const actionMagnetNew: ActionMagnetNew = <ActionMagnetNew>timeline.actions[j];
            const magnet = actionMagnetNew.magnet;
            const magnetid = actionMagnetNew.magnetid;

            const i = indicesSuchThat(timeline.actions, j, t,
                (a: Action) => ((a instanceof ActionMagnetMove))
                    && a.magnetid == magnetid);

            if (i.length > 0) {
                const lasti = i[i.length - 1];
                const actionLastMove: ActionMagnetMove = <ActionMagnetMove>timeline.actions[lasti];
                const lastPoint = actionLastMove.lastPoint;
                BoardManager.executeOperation(new OperationDeleteSeveralActions(i));

                BoardManager.executeOperation(new OperationDeleteSeveralActions([j]));

                const newmagnet = <HTMLElement>magnet.cloneNode(true);
                newmagnet.style.left = lastPoint.x + "px";
                newmagnet.style.top = lastPoint.y + "px";
                BoardManager.executeOperation(new OperationAddAction(new ActionMagnetNew(userid, newmagnet), j));
                this.forgetAnimation(userid);
                return;
            }
        }



        /**
         * MAGNETNEW .... MAGNETDELETE ==> remove
         * .... MAGNETDELETE => remove
         */
        for (const j of indicesSuchThat(timeline.actions, tbegin, t, (a) => a instanceof ActionMagnetDelete)) {
            const actionMagnetDelete: ActionMagnetDelete = <ActionMagnetDelete>timeline.actions[j];
            const magnetid = actionMagnetDelete.magnetid;
            const iNew = indicesSuchThat(timeline.actions, tbegin, j, (a) => a instanceof ActionMagnetNew &&
                a.magnetid == magnetid);

            if (iNew.length > 0) {
                //magnet created and deleted in this slide => remove everything about this magnet
                const i = indicesSuchThat(timeline.actions, tbegin, j,
                    (a) => ((a instanceof ActionMagnetNew) || (a instanceof ActionMagnetMove) || (a instanceof ActionMagnetDelete))
                        && a.magnetid == magnetid);
                BoardManager.executeOperation(new OperationDeleteSeveralActions(i));
                this.forgetAnimation(userid);
                return;
            }
            else { //magnet deleted but created in this slide => remove everything except the deletion {
                const i = indicesSuchThat(timeline.actions, tbegin, j,
                    (a: Action) => ((a instanceof ActionMagnetNew) || (a instanceof ActionMagnetMove))
                        && a.magnetid == magnetid);
                if (i.length > 0) {
                    BoardManager.executeOperation(new OperationDeleteSeveralActions(i));
                    this.forgetAnimation(userid);
                    return;
                }
            }

        }
    }
}


window["BoardManager"] = BoardManager;