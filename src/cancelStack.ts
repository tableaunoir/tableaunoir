import { UserManager } from './UserManager';
import { State } from './State';
import { Action } from './Action';
import { ActionInit } from './ActionInit';


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

        const actionInit = new ActionInit(UserManager.me.userID);
        actionInit.storePostState();
        this._push(actionInit);
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
     * @returns the index of the last pre-computed states
     */
    get lastStateIndex(): number {
        let i = this.currentIndex;
        while (i >= 0) {
            if (this.stack[i].hasPostState)
                return i;
            i--;
        }
        throw "there is no initial state? are you kidding?";
    }


    /**
     * @description undo the last action
     */
    async undo(userid: string): Promise<void> {
        if (!this.canUndo)
            return;

        this.currentIndex--;

        const stateIndex = this.lastStateIndex;
        await this.stack[stateIndex].restoreState();

        for (let i = stateIndex + 1; i <= this.currentIndex; i++)
            await this.stack[i].redo();

        //this.print();
    }

    /**
     * @description redo the next action
     */
    async redo(userid: string): Promise<void> {
        if (!this.canRedo)
            return;

        this.currentIndex++;
        await this.stack[this.currentIndex].redo();

        //this.print();
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


}
