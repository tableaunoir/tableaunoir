import { DrawingCanvas } from './DrawingCanvas';
import { ActionSerialized } from './ActionSerialized';
import { Action } from './Action';

export class ActionClear extends Action {
    
    get xMax(): number { return 0; }

    serializeData(): ActionSerialized {
        return {
            type: "clear",
            pause: this.pause,
            userid: this.userid
        };
    }

    async redo(): Promise<void> {
        DrawingCanvas.clear();
    }


    createOverviewImage(): string {
        return "url(img/icons/erase.svg)";
    }

}