export abstract class Action {

    public userid: string;

    constructor(userid: string) {
        this.userid = userid;
    }
    /**
     * redo the action
     */
    abstract redo(): Promise<void>;
}