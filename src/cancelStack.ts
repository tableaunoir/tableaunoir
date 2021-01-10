import { ActionDeserializer } from './ActionDeserializer';
import { UserManager } from './UserManager';
import { State } from './State';
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
    private stack: (Action)[] = [];
    private currentIndex = -1; //meaning that stack[currentIndex] is treated
    private n = 0;

    /**
     * empty the stack and set it with the current canvas as the initial state
     */
    clear(): void {
        this.stack = [];
        this.currentIndex = -1;

        const actionInit = new ActionInit(UserManager.me.userID, undefined);
        this._push(actionInit);
    }


    clearAndReset(canvasDataURL: string) {
        this.stack = [];
        this.currentIndex = -1;

        const actionInit = new ActionInit(UserManager.me.userID, canvasDataURL);
        actionInit.redo();
        this._push(actionInit);
    }


    get t() {
        return this.currentIndex;
    }

    public async load(A: ActionSerialized[], t: number) {
        this.stack = A.map(ActionDeserializer.deserialize);
        this.n = this.stack.length;
        this.currentIndex = t;
        console.log("loaded stack with " + this.n + " elements");

        const canvas = getCanvas();
        canvas.width = canvas.width + 0;

        for (let u = 0; u <= t; u++)
            await this.stack[u].redo();

        //  this.print();
    }

    private _push(action: Action): void {
        this.currentIndex++;
        this.stack[this.currentIndex] = action;
        this.n = this.currentIndex + 1;
    }

    /**
     *
     * @param {*} data
     */
    push(action: Action): void {
        //   if (Math.floor(100 * Math.random()) < 1/20000)
        //     action.storePostState();
        this._push(action);
        //this.print();
    }


    /**
     * @returns the index of the last pre-computed states, or undefined if none
     */
    get lastStateIndex(): number {
        let i = this.currentIndex;
        while (i >= 0) {
            if (this.stack[i].hasPostState)
                return i;
            i--;
        }
        return undefined;
    }


    /**
     * @description undo the last action
     */
    async undo(userid: string): Promise<void> {
        if (!this.canUndo)
            return;

        this.currentIndex--;

        /*  let stateIndex = this.lastStateIndex;
          if (stateIndex != undefined) {
              await this.stack[stateIndex].restoreState();
          } else stateIndex = -1;*/

        getCanvas().width = getCanvas().width + 0;
        for (let i = 0; i <= this.currentIndex; i++)
            await this.stack[i].redo();

        // this.print();
    }

    /**
     * @description redo the next action
     */
    async redo(userid: string): Promise<void> {
        if (!this.canRedo)
            return;

        this.currentIndex++;
        await this.stack[this.currentIndex].redo();

        //  this.print();
    }


    /**
     * @returns true if there is some previous action to undo
     */
    canUndo(userid: string): boolean { return this.currentIndex >= 1; }


    /**
     * @returns true if there is some next action to redo
     */
    canRedo(userid: string): boolean { return this.currentIndex < this.n - 1; }


    /**
     * @description print the stack in the console (for debug)
     */
    print(): void {
        let s = "";
        for (let i = 0; i < this.stack.length; i++) {
            s += (i == 0) ? "i" : this.stack[i] instanceof State ? "s" : "a";
            s += (i == this.currentIndex) ? ". " : "  ";
        }
        console.log(s);
    }



    serialize(): ActionSerialized[] {
        return this.stack.map((a) => a.serialize());
    }
}
