import { AnimationManager } from './AnimationManager';
import { ActionSerialized } from './ActionSerialized';
import { OptionManager } from './OptionManager';



export abstract class Action {

    /**
     * the user that has performed the action
     */
    public userid: string;
    public pause = false; // TODO: to be deleted
    public isDirectlyUndoable = false;
    public isBlocking = true; //true if this action is sync (i.e. the following actions are waiting this action to be finished)
    private hash = 0;
    private _speed = 0;
    private static _delay = 10;


    static init() {
        /** the user can choose the FPS of the animations :) */
        OptionManager.number({ name: "FPS", defaultValue: 50, onChange: (fps) => Action._delay = 1000 / fps });
    }


    async delay(): Promise<void> { await AnimationManager.delay(Action._delay); }


    constructor(userid: string) { this.userid = userid; }


    /**
     * serialize but does not care about pause
     */
    protected abstract serializeData(): ActionSerialized;

    /**
     * returns hash
     */
    public getHash(): number {
        if (this.hash == undefined) {
            this.hash = 0;
            const obj = this.serializeData();
            const serializedString = JSON.stringify(obj);
            for (let k = 0; k < serializedString.length; k++) {
                this.hash += serializedString.charCodeAt(k);
            }
        }
        return this.hash;
    }


    /**
     * serialize the action
     */
    serialize(): ActionSerialized {
        const obj = this.serializeData();

        if (this.hash == undefined) {
            this.hash = 0;
            const serializedString = JSON.stringify(obj);
            for (let k = 0; k < serializedString.length; k++) {
                this.hash += serializedString.charCodeAt(k);
            }
        }

        return obj;
    }




    /**
     * redo the action
     */
    abstract redo(): Promise<void>; //to be implemented in concrete classes
    async undo(): Promise<void> { return } //by default it cannot be undone
    redoAnimated(): Promise<void> { return this.redo(); } // by default the redo with animation is the same

    abstract get xMax(): number;



    _overviewImage: string = undefined;

    getOverviewImage(): string {
        if (this._overviewImage == undefined)
            this._overviewImage = this.createOverviewImage();
        return this._overviewImage;
    }

    createOverviewImage(): string { return ""; }
}