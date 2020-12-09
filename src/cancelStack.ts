import { getCanvas } from './main';
import { Action } from './Action';


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

        getCanvas().getContext("2d").clearRect(0, 0, getCanvas().width, getCanvas().height);


        this.currentIndex--;
        for (let i = 0; i <= this.currentIndex; i++)
            await this.stack[i].redo();
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
