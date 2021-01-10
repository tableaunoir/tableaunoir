import { State } from './State';


export abstract class Action {

    /**
     * the user that has performed the action
     */
    public userid: string;

    constructor(userid: string) {
        this.userid = userid;
    }


    abstract serialize(): ActionSerialized;
    /**
     * redo the action
     */
    abstract redo(): Promise<void>;

    /**
     * store the state of the board after having executed the action
     * it can be undefined (but then you do not benefit and need to compute the state)
     */
    private postState: State = undefined;


    /**
     * @description store the current state as the post state
     */
    storePostState(): void {
        this.postState = State.createCurrentState();
    }

    /**
     * @returns true iff there is a post state
     */
    get hasPostState(): boolean {
        return this.postState != undefined;
    }


    /**
     * @requires hasPostState to return true
     * @description like redo but restore the state via poststate
     */
    async restoreState(): Promise<void> {
        await this.postState.redo();
    }
}