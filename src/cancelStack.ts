import { CanvasModificationRectangle } from './CanvasModificationRectangle';
import { Action } from './Action';
import { backgroundRepeat } from 'html2canvas/dist/types/css/property-descriptors/background-repeat';


/**
 * data structure stack for cancel/redo
 */
export class CancelStack {
    private stack: Action[] = [];
    private currentIndex = -1;
    private n = 0;

    /**
     * empty the stack
     */
    clear(): void {
        this.stack = [];
        this.currentIndex = -1;
        this.n = 0;
    }

    /**
     *
     * @param {*} data
     */
    push(action: Action): void {
        this.currentIndex++;
        this.stack[this.currentIndex] = action;
        this.n = this.currentIndex + 1;
    }


    async undo(): Promise<void> {
        if (this.currentIndex < 0) {
            return;
        }
            

        await this.stack[this.currentIndex].undo();
        this.currentIndex--;
    }


    async redo(): Promise<void> {
        if (this.currentIndex >= this.n - 1)
            return;

        this.currentIndex++;
        await this.stack[this.currentIndex].redo();
    }



    get canUndo(): boolean {
        return this.currentIndex >= 0;
    }

    get canRedo(): boolean {
        return this.currentIndex < this.n - 1;
    }
   
}
