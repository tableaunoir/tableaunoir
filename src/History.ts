import { BoardManager } from './boardManager';
import { ErrorMessage } from './ErrorMessage';
import { ActionSerialized } from './ActionSerialized';
import { ActionDeserializer } from './ActionDeserializer';
import { UserManager } from './UserManager';
import { Action } from './Action';
import { ActionInit } from './ActionInit';
import { getCanvas } from './main';


/**
 * data structure for the linear history of actions (draw a line, eraser here, etc.)
 * TODO: for the moment, it is single-user (we do not care who are performing actions)
 */
export class History {

    /**
     * stack of actions
     * remark: the first action is of Type ActionInit and is like a sentinelle
     */
    public actions: (Action)[] = [];
    private currentIndex = -1; //meaning that stack[currentIndex] is treated and is the last action executed

    /**
     * empty the stack and set it with the current canvas as the initial state
     */
    clear(): void {
        this.actions = [];
        this.currentIndex = -1;

        const actionInit = new ActionInit(UserManager.me.userID, undefined);
        this._push(actionInit);
        this.updateButtons();
    }


    /**
     * @description clear the canvas
     */
    canvasClear(): void {
        const canvas = getCanvas();
        canvas.width = canvas.width + 0;
    }
    /**
     * empty the cancel stack but keeps the current state
     */
    flatten(): void {
        this.actions = [];
        this.currentIndex = -1;
        const actionInit = new ActionInit(UserManager.me.userID, getCanvas().toDataURL());
        this._push(actionInit);
    }

    /**    setCurrentIndex(i: number): void {
            this.currentIndex = i;
            this.update();
        } */

    /**
     * goto frame t
     */
    setCurrentIndex(t: number): void {
        const previousIndex = this.currentIndex;
        this.currentIndex = t;
        this.updateButtons();
        this.updateState(previousIndex);
    }


    /**
     * 
     * @param previoust 
     * @param nextt 
     * @description update the state given that the current state time step is previoust, and that
     * we aim to go time step nextt
     */
    async updateState(previoust: number): Promise<void> {
        const nextt = this.currentIndex;
        if (previoust <= nextt) { //go to the future
            for (let i = previoust + 1; i <= nextt; i++)
                await this.actions[i].redo();
        }
        else { //go to the past
            let bug113 = false;
            let sthToDoFromStart = false;
            //perform the undo of the undoable actions
            for (let t = previoust; t >= nextt + 1; t--)
                if (this.actions[t] == undefined) {
                    ErrorMessage.show("issue #113. error with t = " + t + " try to undo/redo again");
                    bug113 = true;
                }
                else
                    if (this.actions[t].isDirectlyUndoable)
                        await this.actions[t].undo();
                    else
                        sthToDoFromStart = true;

            if (sthToDoFromStart) {
                this.canvasClear();
                this.canvasRedraw();
                
            }

            if (bug113) {
                this.repair();
            }
        }
    }





/**
     * @returns the current timestep (that is performed)
     * @description this.actions[this.getCurrentIndex()] is the last performed action
     */
    getCurrentIndex(): number { return this.currentIndex; }


    clearAndReset(canvasDataURL: string): void {
        this.actions = [];
        this.currentIndex = -1;

        const actionInit = new ActionInit(UserManager.me.userID, canvasDataURL);
        actionInit.redo();
        this._push(actionInit);
    }

    /**
     * 
     * @param A the array of serialized action
     * @param t the current timestep
     * @description loads the cancelStack
     */
    public async load(A: ActionSerialized[], t: number): Promise<void> {
        this.actions = A.map(ActionDeserializer.deserialize);
        this.currentIndex = t;
        console.log("loaded stack with " + this.actions.length + " elements");
        this.resetAndUpdate();

    }


    /**
     * @description updates the canvas and the magnets completely from the start
     */
    private async resetAndUpdate(): Promise<void> {
        this.canvasClear();
        if (BoardManager.MAGNETCANCELLABLE)
            document.getElementById("magnets").innerHTML = "";

        this.updateButtons();

        await this.doAllActionsUntilCurrentIndex();
    }


    private _push(action: Action): void {

        this.currentIndex++;

        /** we remove all elements after the currentIndex */
        while (this.actions.length > this.currentIndex)
            this.actions.pop();

        this.actions.push(action);

        this.currentIndex = this.actions.length - 1; //because we removed

    }


    /**
     * 
     * @param action 
     * @description insert action at the current index
     */
    private _insert(action: Action): void {
        this.currentIndex++;
        this.actions.splice(this.currentIndex, 0, action);
    }



    /**
     * 
     * @param i 
     * @param j 
     * @description move action at time i to actual time j
     */
    move(i: number, j: number): void {
        if (i == 0 || j == 0)
            return;

        if (i < j) //the position j shifts to the left since i is before
            j--;

        const action = this.actions[i];
        this.actions.splice(i, 1);
        this.actions.splice(j, 0, action);
        this.resetAndUpdate();
    }



    /**
     * 
     * @param t 
     * @description delete action at time t
     */
    delete(t: number): void {
        if (t == 0)
            return;

        this.actions.splice(t, 1);
        if (t <= this.currentIndex)
            this.currentIndex--;
        this.resetAndUpdate();
    }

    /**
     *
     * @param {*} data
     */
    push(action: Action): void {
        //if (AnimationToolBar.is()) // the behavior should not change depending on the presence of the animation toolbar!
            this._insert(action); 
        //else
          //  this._push(action);
        this.updateButtons();
        //this.print();
    }




    async canvasRedraw(): Promise<void> {
        let bug113 = false;

        //perform the do actions from start for the actions that are not undoable
        for (let t = 0; t <= this.currentIndex; t++) {
            if (this.actions[t] == undefined) {
                ErrorMessage.show("issue #113. error with t = " + t + " try to undo/redo again");
                bug113 = true;
            }
            else if (!this.actions[t].isDirectlyUndoable)
                await this.actions[t].redo();

        }
        if (bug113) 
            this.repair();
        
    }
    /**
     * @description do all the actions until the current index
     */
    private async doAllActionsUntilCurrentIndex(): Promise<void> {
        let bug113 = false;
        for (let t = 0; t <= this.currentIndex; t++) {
            if (this.actions[t] == undefined) {
                ErrorMessage.show("issue #113. error with t = " + t + " try to undo/redo again");
                bug113 = true;
            }
            else
                await this.actions[t].redo();

        }
        if (bug113) 
            this.repair();
        
    }


    /**
     * 
     * @returns the last executed action
     */
    getLastAction(): Action { return this.actions[this.currentIndex]; }

    /**
     * @description undo the last action
     */
    async undo(userid: string): Promise<void> {
        if (!this.canUndo)
            return;
        this.setCurrentIndex(this.currentIndex - 1);

        /**
    this.currentIndex--;
    this.updateButtons();

    if (this.actions[this.currentIndex + 1].isDirectlyUndoable)
        await this.actions[this.currentIndex + 1].undo();
    else {
        getCanvas().width = getCanvas().width + 0;

        if (BoardManager.MAGNETCANCELLABLE)
            document.getElementById("magnets").innerHTML = "";
        await this.playUntilCurrentIndex();
        // this.print();

    } */


    }

    /**
     * @description redo the next action
     */
    async redo(userid: string): Promise<void> {
        if (!this.canRedo)
            return;

        this.setCurrentIndex(this.currentIndex + 1);
    }

    /**
     * 
     * @returns the time step index of the previous paused frame
     */
    getPreviousPausedFrame(): number {
        for (let i = this.currentIndex - 1; i >= 0; i--)
            if (this.actions[i].pause)
                return i;
        return this.currentIndex; //no "pause" action found, so we stay at the same frame
    }

    /**
     * 
     * @returns the time step index of the next paused frame
     */
    getNextPausedFrame(): number {
        for (let i = this.currentIndex + 1; i <= this.actions.length - 1; i++)
            if (this.actions[i].pause)
                return i;
        return this.currentIndex; //no "pause" action found, so we stay at the same frame // this.actions.length - 1;
    }



    /**
     * go to the presvious paused frame
     */
    async previousPausedFrame(): Promise<void> {
        if (!this.canUndo)
            return;

        const newIndex = this.getPreviousPausedFrame();
        this.setCurrentIndex(newIndex);
        /*
        if (newIndex != this.currentIndex) {
            this.currentIndex = newIndex;
            this.updateButtons();

            getCanvas().width = getCanvas().width + 0;
            if (BoardManager.MAGNETCANCELLABLE)
                document.getElementById("magnets").innerHTML = "";
            await this.playUntilCurrentIndex();
        }*/

    }


    /**
     * 
     * @returns 
     * @description go to the paused next frame by playing the animations
     */
    async nextPausedFrame(): Promise<void> {
        if (!this.canRedo)
            return;

        const tGoal = this.getNextPausedFrame();
        for (let i = this.currentIndex + 1; i <= tGoal; i++)
            await this.actions[i].redoAnimated();

        this.currentIndex = tGoal;
        this.updateButtons();
    }


    /**
     * @returns true if there is some previous action to undo
     */
    canUndo(userid: string): boolean { return this.currentIndex >= 1; }


    /**
     * @returns true if there is some next action to redo
     */
    canRedo(userid: string): boolean { return this.currentIndex < this.actions.length - 1; }


    /**
     * @description print the stack in the console (for debug)
     */
    __str__(): string {
        let s = "";
        for (let i = 0; i < this.actions.length; i++) {
            s += (i == 0) ? "i" : ((this.actions[i] == undefined) ? "u" : "a");
            s += (i == this.currentIndex) ? ". " : "  ";
        }
        return s;
    }


    /**
     * @description used because of the #113 issue
     */
    repair(): void {
        if (this.actions.indexOf(undefined) >= 0) {
            ErrorMessage.show("#113 issue"); //we remove the undefined elements in the tab
            this.actions = this.actions.filter((a) => a != undefined);
            this.currentIndex = this.actions.length - 1;
        }
    }

    /**
     * @returns the serialized version of the cancelstack (an array of serialized actions)
     */
    serialize(): ActionSerialized[] {
        this.repair();
        return this.actions.map((a) => a ? a.serialize() : undefined);
    }


    /**
     * @description update the GUI
     */
    updateButtons(): void {
        if (this.canUndo(UserManager.me.userID))
            document.getElementById("buttonCancel").classList.remove("disabled");
        else
            document.getElementById("buttonCancel").classList.add("disabled");

        if (this.canRedo(UserManager.me.userID))
            document.getElementById("buttonRedo").classList.remove("disabled");
        else
            document.getElementById("buttonRedo").classList.add("disabled");
    }
}
