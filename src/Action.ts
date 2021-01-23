import { ActionSerialized } from './ActionSerialized';



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


}