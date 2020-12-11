import { State } from './State';
import { Action } from './Action';


/**
 * data structure stack for cancel/redo
 */
export class CancelStack {

    /**
     * stack of states and actions (the first element is a state and then there are some states)
     * the other states are precomputed 
     * 
     * s_0 a_1 a_2 a_3 s_4 a_5 a_6
     *   => s_4 is precomputed from s_0 and then applying a_1 a_2 a_3
     */
    private stack: (Action | State)[] = [];
    private currentIndex = -1;
    private n = 0;

    /**
     * empty the stack and set it with the current canvas as the initial state
     */
    clear(): void {
        this.stack = [];
        this.currentIndex = -1;
        this._push(State.createCurrentState());
    }



    private _push(actionOrState: Action | State): void {
        this.currentIndex++;
        this.stack[this.currentIndex] = actionOrState;
        this.n = this.currentIndex + 1;
    }

    /**
     *
     * @param {*} data
     */
    push(action: Action): void {
        this._push(action);

        //sometimes, add the current state at the end of the action
        if (Math.floor(100 * Math.random()) < 30)
            this._push(State.createCurrentState());

    }


    /**
     * @returns the index of the last pre-computed states
     */
    get lastStateIndex(): number {
        let i = this.currentIndex;
        while (i >= 0) {
            if (this.stack[i] instanceof State)
                return i;
            i--;
        }
        throw "there is no initial state?";
    }

    
    /**
     * @description undo the last action
     */
    async undo(userid: string): Promise<void> {
        if (!this.canUndo)
            return;

        if (this.stack[this.currentIndex] instanceof State)
            this.currentIndex -= 1;

        this.currentIndex -= 1;
        for (let i = this.lastStateIndex; i <= this.currentIndex; i++)
            await this.stack[i].redo();
    }

    /**
     * @description redo the next action
     */
    async redo(userid: string): Promise<void> {
        if (!this.canRedo)
            return;

        if (this.stack[this.currentIndex] instanceof State)
            this.currentIndex++;

        await this.stack[this.currentIndex].redo();

        this.currentIndex++;
    }


    /**
     * @returns true if there is some previous action to undo
     */
    canUndo(userid: string): boolean { return this.currentIndex >= 1; }


    /**
     * @returns true if there is some next action to redo
     */
    canRedo(userid: string): boolean { return this.currentIndex < this.n - 1; }

}
