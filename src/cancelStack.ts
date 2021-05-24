import { AnimationToolBar } from './AnimationToolBar';
import { ErrorMessage } from './ErrorMessage';
import { ActionSerialized } from './ActionSerialized';
import { ActionDeserializer } from './ActionDeserializer';
import { UserManager } from './UserManager';
import { Action } from './Action';
import { ActionInit } from './ActionInit';
import { getCanvas } from './main';


/**
 * data structure stack for cancel/redo
 * TODO: for the moment, it is single-user (we do not care who are performing actions)
 */
export class CancelStack {

    /**
     * stack of actions
     * some actions may contain a "poststate" (a full snapshot of the state after executing that action)
     * remark: the first action is of Type ActionInit and always contains a postState
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
     * empty the cancel stack but keeps the current state
     */
    flatten(): void {
        this.actions = [];
        this.currentIndex = -1;
        const actionInit = new ActionInit(UserManager.me.userID, getCanvas().toDataURL());
        this._push(actionInit);
    }

    setCurrentIndex(i: number): void {
        this.currentIndex = i;
        this.updateButtons();
        getCanvas().width = getCanvas().width + 0;
        this.playUntilCurrentIndex();
    }


    getCurrentIndex(): number {
        return this.currentIndex;
    }

    clearAndReset(canvasDataURL: string): void {
        this.actions = [];
        this.currentIndex = -1;

        const actionInit = new ActionInit(UserManager.me.userID, canvasDataURL);
        actionInit.redo();
        this._push(actionInit);
    }

    /**
     * @returns the current timestep (that is performed)
     * @example this.stack[t] has been performed and that is the last performed action
     */
    get t(): number { return this.currentIndex; }

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
        this.update();

    }


    /**
     * @description updates the canvas
     */
    async update(): Promise<void> {
        const canvas = getCanvas();
        canvas.width = canvas.width + 0;

        this.updateButtons();

        await this.playUntilCurrentIndex();
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
        this.update();
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
        this.update();
    }

    /**
     *
     * @param {*} data
     */
    push(action: Action): void {
        //   if (Math.floor(100 * Math.random()) < 1/20000)
        //     action.storePostState();

        if (AnimationToolBar.is())
            this._insert(action);
        else
            this._push(action);
        this.updateButtons();
        //this.print();
    }

    /**
     * @description do all the actions until the current index
     */
    async playUntilCurrentIndex(): Promise<void> {
        let bug113 = false;
        for (let t = 0; t <= this.currentIndex; t++) {
            if (this.actions[t] == undefined) {
                ErrorMessage.show("issue #113. error with t = " + t + " try to undo/redo again");
                bug113 = true;
            }
            else
                await this.actions[t].redo();

        }
        if (bug113) {
            this.repair();
        }
    }

    /**
     * @description undo the last action
     */
    async undo(userid: string): Promise<void> {
        if (!this.canUndo)
            return;

        this.currentIndex--;

        this.updateButtons();

        getCanvas().width = getCanvas().width + 0;
        await this.playUntilCurrentIndex();
        // this.print();
    }

    /**
     * @description redo the next action
     */
    async redo(userid: string): Promise<void> {
        if (!this.canRedo)
            return;

        this.currentIndex++;
        await this.actions[this.currentIndex].redo();

        this.updateButtons();

        //  this.print();
    }

    getPreviousPausedFrame(): number {
        for (let i = this.currentIndex - 1; i >= 0; i--)
            if (this.actions[i].pause)
                return i;
        return this.currentIndex; //no "pause" action found, so we stay at the same frame
    }

    getNextPausedFrame(): number {
        for (let i = this.currentIndex + 1; i <= this.actions.length - 1; i++)
            if (this.actions[i].pause)
                return i;
        return this.currentIndex; //no "pause" action found, so we stay at the same frame // this.actions.length - 1;
    }




    async previousPausedFrame(): Promise<void> {
        if (!this.canUndo)
            return;

        const newIndex = this.getPreviousPausedFrame();
        if(newIndex != this.currentIndex) {
            this.currentIndex = newIndex;
            this.updateButtons();
    
            getCanvas().width = getCanvas().width + 0;
            await this.playUntilCurrentIndex();
        }
        
    }



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
