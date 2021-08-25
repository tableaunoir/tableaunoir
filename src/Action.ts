import { AnimationManager } from './AnimationManager';
import { ActionSerialized } from './ActionSerialized';



export abstract class Action {

    /**
     * the user that has performed the action
     */
    public userid: string;
    public pause = false;
    public isDirectlyUndoable = false;
    public isBlocking = true;
    private hash = 0;
    private _speed = 1;
    private _delay = this.getDelay(this._speed);

    private getDelay(speed: number): number {
        switch (speed) {
            case 0: return 20;
            case 1: return 4; //default
            case 2: return 1;
        }
        return 0;
    }

    set speed(speed: number) {
        this._speed = speed;
        this._delay = this.getDelay(speed);
    }


    async delay(): Promise<void> { await AnimationManager.delay(this._delay); }


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

        if (!obj.pause)
            delete obj.pause;

        return obj;
    }




    /**
     * redo the action
     */
    abstract redo(): Promise<void>;

    async undo(): Promise<void> { return } //by default it cannot be undone

    redoAnimated(): Promise<void> { return this.redo(); }
    abstract get xMax(): number;

    protected static createCanvasOverview(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = 24;
        canvas.height = 24;
        return canvas;
    }


    _overviewImage: string = undefined;

    getOverviewImage(): string {
        if (this._overviewImage == undefined)
            this._overviewImage = this.createOverviewImage();
        return this._overviewImage;
    }

    createOverviewImage(): string { return ""; }
}