import { Drawing } from './Drawing';
import { ActionSerialized } from './ActionSerialized';



export abstract class Action {

    /**
     * the user that has performed the action
     */
    public userid: string;
    public pause = false;
    public isDirectlyUndoable = false;
    public isBlocking = true;
    private _speed = 3;
    private _delay = 1;

    private getDelay(speed: number): number {
        switch (speed) {
            case 0: return 100;
            case 1: return 50;
            case 2: return 1;
        }
        return 0;
    }

    set speed(speed: number) {
        this._speed = speed;
        this._delay = this.getDelay(speed);
    }


    async delay(): Promise<void> {
        if (this._delay > 0)
            await Drawing.delay(this._delay);
    }


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

    async undo(): Promise<void> { return } //by default it cannot be undone

    redoAnimated(): Promise<void> { return this.redo(); }
    abstract get xMax(): number;

    protected static createCanvasOverview(): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = 24;
        canvas.height = 24;
        return canvas;
    }


    getOverviewImage(): string { return ""; }
}