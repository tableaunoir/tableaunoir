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
    private stack: (Action)[] = [];
    private currentIndex = -1; //meaning that stack[currentIndex] is treated and is the last action executed

    /**
     * empty the stack and set it with the current canvas as the initial state
     */
    clear(): void {
        this.stack = [];
        this.currentIndex = -1;

        const actionInit = new ActionInit(UserManager.me.userID, undefined);
        this._push(actionInit);
        this.updateButtons();
    }

    /**
     * empty the cancel stack but keeps the current state
     */
    flatten(): void {
        this.stack = [];
        this.currentIndex = -1;
        const actionInit = new ActionInit(UserManager.me.userID, getCanvas().toDataURL());
        this._push(actionInit);
    }


    clearAndReset(canvasDataURL: string): void {
        this.stack = [];
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
        this.stack = A.map(ActionDeserializer.deserialize);
        this.currentIndex = t;
        console.log("loaded stack with " + this.stack.length + " elements");

        const canvas = getCanvas();
        canvas.width = canvas.width + 0;

        this.updateButtons();

        await this.playUntilCurrentIndex();
    }

    private _push(action: Action): void {
        
        this.currentIndex++;

        /** we remove all elements after the currentIndex */
        while(this.stack.length > this.currentIndex)
            this.stack.pop();

        this.stack.push(action);

        this.currentIndex = this.stack.length - 1; //because we removed
        
    }

    /**
     *
     * @param {*} data
     */
    push(action: Action): void {
        //   if (Math.floor(100 * Math.random()) < 1/20000)
        //     action.storePostState();
        this._push(action);
        this.updateButtons();
        //this.print();
    }

    /**
     * @description do all the actions until the current index
     */
    async playUntilCurrentIndex(): Promise<void> {
        let bug113 = false;
        for (let i = 0; i <= this.currentIndex; i++) {
            if (this.stack[i] == undefined) {
                ErrorMessage.show("issue #113. error with i = " + i + "try to undo/redo again");
                bug113 = true;
            }
            else
                await this.stack[i].redo();

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

        /*  let stateIndex = this.lastStateIndex;
          if (stateIndex != undefined) {
              await this.stack[stateIndex].restoreState();
          } else stateIndex = -1;*/
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
        await this.stack[this.currentIndex].redo();

        this.updateButtons();

        //  this.print();
    }


    /**
     * @returns true if there is some previous action to undo
     */
    canUndo(userid: string): boolean { return this.currentIndex >= 1; }


    /**
     * @returns true if there is some next action to redo
     */
    canRedo(userid: string): boolean { return this.currentIndex < this.stack.length - 1; }


    /**
     * @description print the stack in the console (for debug)
     */
    __str__(): string {
        let s = "";
        for (let i = 0; i < this.stack.length; i++) {
            s += (i == 0) ? "i" : ((this.stack[i] == undefined) ? "u" : "a");
            s += (i == this.currentIndex) ? ". " : "  ";
        }
        return s;
    }



    repair(): void {
        if (this.stack.indexOf(undefined) >= 0) {
            ErrorMessage.show("#113 issue"); //we remove the undefined elements in the tab
            this.stack = this.stack.filter((a) => a != undefined);
            this.currentIndex = this.stack.length - 1;
        }
    }

    /**
     * @returns the serialized version of the cancelstack (an array of serialized actions)
     */
    serialize(): ActionSerialized[] {
        this.repair();
        return this.stack.map((a) => a ? a.serialize() : undefined);
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
