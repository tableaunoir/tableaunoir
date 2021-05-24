import { ActionSerialized } from './ActionSerialized';



export abstract class Action {

    /**
     * the user that has performed the action
     */
    public userid: string;
    public pause = false;

    constructor(userid: string) {
        this.userid = userid;
    }


    /**
     * serialize but does not care about pause
     */
    protected abstract serializeData(): ActionSerialized;


    /**
     * serialize the action
     */
    serialize(): ActionSerialized {
        const obj = this.serializeData();
        if (!obj.pause)
            delete obj.pause;
        return obj;
    }

    /**
     * redo the action
     */
    abstract redo(): Promise<void>;

    redoAnimated(): Promise<void> { return this.redo(); }
    abstract get xMax(): number;


}