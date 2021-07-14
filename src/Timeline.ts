import { ActionClear } from './ActionClear';
import { Drawing } from './Drawing';
import { BoardManager } from './boardManager';
import { ErrorMessage } from './ErrorMessage';
import { ActionSerialized } from './ActionSerialized';
import { ActionDeserializer } from './ActionDeserializer';
import { UserManager } from './UserManager';
import { Action } from './Action';
import { ActionInit } from './ActionInit';



/**
 * data structure for the linear history of actions (draw a line, eraser here, etc.)
 */
export class Timeline {

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
        const actionInit = new ActionInit(UserManager.me.userID, undefined);
        this.actions = [actionInit];
        this.currentIndex = 0;
    }


    /**
     * goto frame t
     */
    setCurrentIndex(t: number): void {
        const previousIndex = this.currentIndex;
        this.currentIndex = t;
        this.updateState(previousIndex);
    }


    /**
     * 
     * @param action 
     * @return the timestep of the action, if the action is present in the timeline, returns -1 if not present
     */
    getTimeStepForActionCloseTo(action: Action, t: number): number {
        if (this.actions[t] == action)
            return t;

        const actionSerialized = JSON.stringify(action.serialize());

        if (this.actions[t])
            if (JSON.stringify(this.actions[t].serialize()) == actionSerialized)
                return t;

        return this.actions.findIndex((a) => {
            if (a.constructor == action.constructor)
                return actionSerialized == JSON.stringify(a.serialize());
            else
                return false;
        }
        );
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
                Drawing.clear();
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
        const actionInit = new ActionInit(UserManager.me.userID, canvasDataURL);
        actionInit.redo();
        this.actions = [actionInit];
        this.currentIndex = 0;
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
        Drawing.clear();
        if (BoardManager.MAGNETCANCELLABLE)
            document.getElementById("magnets").innerHTML = "";

        await this.doAllActionsUntilCurrentIndex();
    }

    /**
     *
     * @param elToInsert
     * @param indexesArray
     * @param insertIndex
     *
     * @description moves actions referred to in indexesArray (or elToInsert) to pos insertIndex in this.action
     */
    move(indexToMove: number, insertIndex: number): void {
        if (insertIndex == 0 || indexToMove == 0)
            return;

        const eltToAdd = this.actions[indexToMove];

        this.actions.splice(indexToMove, 1);
        this.actions.splice(insertIndex, 0, eltToAdd);
        this.resetAndUpdate();
    }

    /**
     * @param action
     * @param t
     * @description insert action at time t, the action will be this.actions[t], update the state
     */
    insert(action: Action, t: number): void {
        this.actions.splice(t, 0, action);
        if (t == this.currentIndex + 1) {
            //we insert an action just after the current moment
            //no problem we execute that action and +1 to currentIndex
            this.currentIndex++;
            this.actions[t].redo();
        }
        else {
            if (t <= this.currentIndex)
                this.currentIndex++;
            this.resetAndUpdate();
        }

    }



    /**
     *
     * @param {*} action
     * @description insert now an action that was already executed
     */
    insertNowAlreadyExecuted(action: Action): void {
        //     this.currentIndex++;
        //   this.actions.splice(this.currentIndex, 0, action);
        this.insert(action, this.currentIndex + 1);

    }




    /**
     * 
     * @param t 
     * @description delete action at time t
     */
    delete(t: number): void {
        if (t == 0) //the first action cannot be removed
            return;

        //if the action deleted is the current one, use the optimized version
        if (t == this.currentIndex) {
            this.currentIndex--;
            this.updateState(t);
        }

        this.actions.splice(t, 1); //really delete

        //if the currentindex is after the deleted action, update
        if (t < this.currentIndex) {
            this.currentIndex--;
            this.resetAndUpdate();
        }

    }

    /**
     * 
     * @returns the last index of the clear action
     * or 0 if no clear action was found
     */
    getLastClearAction(): number {
        for (let t = this.currentIndex; t >= 0; t--) {
            if (this.actions[t] instanceof ActionClear)
                return t;
        }
        return 0;
    }



    async canvasRedraw(): Promise<void> {
        let bug113 = false;

        //perform the do actions from the last time we cleared the canvas until this.currentIndex
        // for the actions that are not undoable
        for (let t = this.getLastClearAction(); t <= this.currentIndex; t++) {
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
     * @returns the time step index of the next paused frame (or the last action index)
     */
    getNextPausedFrame(): number {
        for (let i = this.currentIndex + 1; i <= this.actions.length - 1; i++)
            if (this.actions[i].pause)
                return i;
        return this.actions.length - 1;//this.currentIndex; //no "pause" action found, so we stay at the same frame // this.actions.length - 1;
    }



    /**
     * go to the presvious paused frame
     */
    async previousPausedFrame(): Promise<void> {
        if (this.isBegin())
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
        if (this.isEnd())
            return;

        const tGoal = this.getNextPausedFrame();
        for (let i = this.currentIndex + 1; i <= tGoal; i++)
            if (this.actions[i].isBlocking)
                await this.actions[i].redoAnimated();
            else
                this.actions[i].redoAnimated();  //execution in parallel
        this.currentIndex = tGoal;
    }


    /**
     * @returns true if we are at the beginning of the timeline
     */
    isBegin(): boolean { return this.currentIndex <= 0; }


    /**
     * @returns true if we are at the end of the timeline
     */
    isEnd(): boolean { return this.currentIndex >= this.actions.length - 1; }


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



}