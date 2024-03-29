import { ActionSlideStart } from './ActionSlideStart';
import { AnimationToolBar } from './AnimationToolBar';
import { ActionClear } from './ActionClear';
import { Drawing } from './Drawing';
import { BoardManager } from './boardManager';
import { ShowMessage } from './ShowMessage';
import { ActionSerialized } from './ActionSerialized';
import { ActionDeserializer } from './ActionDeserializer';
import { UserManager } from './UserManager';
import { Action } from './Action';
import { ActionInit } from './ActionInit';



/**
 * data structure for the linear history of actions (draw a line, eraser here, etc.)
 */
export class Timeline {
    getSlideNumber(): number {
        let c = 1;
        for (let i = 1; i <= this.currentIndex; i++) {
            if (this.actions[i] instanceof ActionSlideStart)
                c++;
        }
        return c;
    }

    /**
     * stack of actions
     * remark: the first action is of Type ActionSlideStart and is like a sentinelle
     */
    public actions: (Action)[] = [];
    private currentIndex = -1; //meaning that stack[currentIndex] is treated and is the last action executed

    /**
     * empty the stack and set it with the current canvas as the initial state
     */
    clear(): void {
        const actionInit = new ActionSlideStart(UserManager.me.userID);
        this.actions = [actionInit];
        this.currentIndex = 0;
    }


    /**
     * goto frame t
     * if t is greater than the number of frames, go at the end
     */
    async setCurrentIndex(t: number): Promise<void> {
        const previousIndex = this.currentIndex;
        this.currentIndex = Math.min(this.actions.length - 1, t);
        await this.updateState(previousIndex);
    }


    /**
     * @returns the number of actions
     */
    get nbActions(): number { return this.actions.length; }

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
        // nextt < previoust and nextt < this.getNextClearAction()
        else if (this.getNextClearAction() > previoust)  //go a lot in the past (i.e. in a previous slide)
        // nextt  < previoust < this.getNextClearAction()
        {
            let bug113 = false;
            let sthToDoFromStart = false;
            //perform the undo of the undoable actions
            for (let t = previoust; t >= nextt + 1; t--)
                if (this.actions[t] == undefined) {
                    ShowMessage.error("issue #113. error with t = " + t + " try to undo/redo again");
                    bug113 = true;
                }
                else
                    if (this.actions[t].isDirectlyUndoable)
                        await this.actions[t].undo();
                    else
                        sthToDoFromStart = true;

            if (sthToDoFromStart) {
                Drawing.clear();
                await this.canvasRedraw();

            }

            if (bug113)
                this.repair();

        } //go in the past but not so much (in particular no clear the board action)
        else {
            this.resetAndUpdate();
        }


    }





    /**
         * @returns the current timestep (that is performed)
         * @description this.actions[this.getCurrentIndex()] is the last performed action
         */
    getCurrentIndex(): number { return this.currentIndex; }



    getIndexLastActionByUser(userid: string): number {
        for (let t = this.currentIndex; t >= 0; t--) {
            if (this.actions[t].userid == userid)
                return t;
        }
        return -1; //userid has performed no actions
    }


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
        this.actions = [];
        for (const actionSerialized of A) {
            const action = (actionSerialized.type == "init" && actionSerialized.canvasDataURL == undefined) ? new ActionSlideStart(undefined) :
                ActionDeserializer.deserialize(actionSerialized);
            this.actions.push(action);
            if ((<any>actionSerialized).pause)
                this.actions.push(new ActionSlideStart(undefined));
        }
        //this.actions = A.map(ActionDeserializer.deserialize);
        this.currentIndex = t;
        console.log("loaded stack with " + this.actions.length + " elements");
        this.resetAndUpdate();

    }


    /**
     * @description updates the canvas and the magnets completely from the start
     */
    public async resetAndUpdate(): Promise<void> {
        Drawing.clear();
        if (BoardManager.MAGNETCANCELLABLE)
            document.getElementById("magnets").innerHTML = "";

        await this.doAllActionsUntilCurrentIndex();
    }


    /**
     * @description do all the actions until the current index
     */
    private async doAllActionsUntilCurrentIndex(): Promise<void> {
        let bug113 = false;
        for (let t = this.getLastClearAction() + 1; t <= this.currentIndex; t++) {
            if (this.actions[t] == undefined) {
                ShowMessage.error("issue #113. error with t = " + t + " try to undo/redo again");
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
     * @param elToInsert
     * @param indexesArray
     * @param insertIndex
     *
     * @description moves actions referred to in indexesArray (or elToInsert) to pos insertIndex in this.action
     * DO NOT REFRESH THE BOARD
     */
    moveAction(indexToMove: number, insertIndex: number): void {
        const eltToAdd = this.actions[indexToMove];

        this.actions.splice(indexToMove, 1);
        this.actions.splice(insertIndex, 0, eltToAdd);
    }

    /**
     * @param action
     * @param t
     * @description insert action at time t, the action will be this.actions[t], update the state
     */
    insertAction(action: Action, t: number, executeAgain = true): void {
        this.actions.splice(t, 0, action);

        if (t == this.currentIndex + 1) {
            //we insert an action just after the current moment
            //no problem we execute that action and +1 to currentIndex
            this.currentIndex++;
            if (executeAgain)
                this.actions[t].redo();
        }
        else {
            if (t <= this.currentIndex)
                this.currentIndex++;
            this.resetAndUpdate();
        }

        AnimationToolBar.updateAddAction(t);
    }


    /**
     * 
     * @param indices 
     * @param actionTable 
     * @description insert actions actionTable at the indices given in indices, update the state at the end of all insertions
     */
    insertActions(indices: number[], actionTable: Action[]): void {
        for (let i = 0; i < actionTable.length; i++) {
            const t = indices[i];
            const action = actionTable[i];
            this.actions.splice(t, 0, action);
            if (t <= this.currentIndex)
                this.currentIndex++;
        }
        this.resetAndUpdate();
        AnimationToolBar.update();
    }


    /**
     *
     * @param {*} action
     * @description insert now an action that was already executed
     */
    insertActionNowAlreadyExecuted(action: Action, executeAgain = true): void {
        this.insertAction(action, this.currentIndex + 1, executeAgain);
    }


    /**
         * 
         * @param indices the indices (that should be ordered by increasing indices)
         * @description delete actions at timesteps given by the indices 
         */
    async deleteActions(indices: number[]): Promise<void> {
        for (let i = indices.length - 1; i >= 0; i--) {
            const t = indices[i];
            if (t <= this.currentIndex)
                this.currentIndex--;
            this.actions.splice(t, 1); //really delete
        }

        if (this.actions.length == 0)
            this.clear();

        await this.resetAndUpdate();

        AnimationToolBar.update();
    }


    /**
     * 
     * @param t 
     * @description delete action at time t
     */
    async deleteAction(t: number): Promise<void> {
        if (t == 0) //the first action cannot be removed
            return;

        //if the action deleted is the current one, use the optimized version
        if (t == this.currentIndex) {
            this.currentIndex--;
            await this.updateState(t);
        }

        this.actions.splice(t, 1); //really delete

        //if the currentindex is after the deleted action, update
        if (t < this.currentIndex) {
            this.currentIndex--;
            await this.resetAndUpdate();
        }

        if (this.actions.length == 0)
            this.clear();

        AnimationToolBar.updateDeleteAction(t);
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


    /**
     * 
     * @returns the next index of the clear action
     * or 0 if no clear action was found
     */
    getNextClearAction(): number {
        for (let t = this.currentIndex; t < this.actions.length; t++) {
            if (this.actions[t] instanceof ActionClear)
                return t;
        }
        return Infinity;
    }


    /**
     * @property the canvas should have been clearer before (otherwise, it is a mess ;) )
     * @description redraw the canvas (from the last clear action, but we do not clear)
     */
    async canvasRedraw(): Promise<void> {
        let bug113 = false;

        //perform the do actions from the last time we cleared the canvas until this.currentIndex
        // for the actions that are not undoable
        for (let t = this.getLastClearAction() + 1; t <= this.currentIndex; t++) {
            if (this.actions[t] == undefined) {
                ShowMessage.error("issue #113. error with t = " + t + " try to undo/redo again");
                bug113 = true;
            }
            else if (!this.actions[t].isDirectlyUndoable)
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
     * @returns the last time step index of the previous slide
     */
    getPreviousSlideLastFrame(): number {
        for (let i = this.currentIndex - 1; i >= 0; i--)
            if (this.actions[i] instanceof ActionSlideStart)
                return i - 1;  //end of slide is just before the pause
        return this.currentIndex; //no "pause" action found, so we stay at the same frame
    }


    /**
   * 
   * @returns the time step of the next "newslide" after the current slide
   */
    getNextNewSlideActionIndex(): number {
        for (let i = this.currentIndex + 1; i <= this.actions.length - 1; i++)
            if (this.actions[i] instanceof ActionSlideStart)
                return i;
        return undefined;
    }


    /**
     * 
     * @returns the last time step index of the next slide (or the current one if it is not completed)
     */
    getNextSlideLastFrame(): number {
        // if this.currentIndex is the end Action of a silde, then this.currentIndex + 1 is the index of ActionNewSlide (that starts the next slide) so we start at this.currentIndex + 2.
        for (let i = this.currentIndex + 2; i <= this.actions.length - 1; i++)
            if (this.actions[i] instanceof ActionSlideStart)
                return i - 1; //end of slide is just before the pause
        return this.actions.length - 1;//this.currentIndex; //no "pause" action found, so we stay at the same frame // this.actions.length - 1;
    }



    /**
     * go to the presvious paused frame
     */
    async previousPausedFrame(): Promise<void> {
        if (this.isBegin())
            return;

        const newIndex = this.getPreviousSlideLastFrame();

        //if newIndex = 0 means that we are already in the first slide
        if (newIndex > 0)
            this.setCurrentIndex(newIndex);
        /*
        if (newIndex != this.currentIndex) {
            this.currentIndex = newIndex;s
            this.updateButtons();

            getCanvas().width = getCanvas().width + 0;
            if (BoardManager.MAGNETCANCELLABLE)
                document.getElementById("magnets").innerHTML = "";
            await this.playUntilCurrentIndex();
        }*/

    }



    /**
     * go to the presvious frame
     */
    async previousFrame(): Promise<void> {
        if (this.isBegin())
            return;

        const newIndex = this.getCurrentIndex() - 1;
        this.setCurrentIndex(newIndex);


    }


    /**
     * 
     * @returns 
     * @description go to the paused next frame by playing the animations
     */
    async nextPausedFrame(): Promise<void> {
        if (this.isEnd())
            return;

        const tGoal = this.getNextSlideLastFrame();
        for (let i = this.currentIndex + 1; i <= tGoal; i++)
            if (this.actions[i].isBlocking)
                await this.actions[i].redoAnimated();
            else
                this.actions[i].redoAnimated();  //execution in parallel
        this.currentIndex = tGoal;
    }


    /**
     * @description go to the next frame
     */
    async nextFrame(): Promise<void> {
        if (this.isEnd())
            return;

        const newIndex = this.getCurrentIndex() + 1;
        this.setCurrentIndex(newIndex);


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
            ShowMessage.error("#113 issue"); //we remove the undefined elements in the tab
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
     * @returns true if there are several slides
     */
    isSeveralSlides(): boolean {
        let countSlides = 0;
        for (const action of this.actions) {
            if (action instanceof ActionSlideStart) {
                countSlides++;
                if (countSlides > 1)
                    return true;

            }
        }
        return false;
    }

}