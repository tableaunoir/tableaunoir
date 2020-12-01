import { CanvasModificationRectangle } from './CanvasModificationRectangle';
/**
 * data structure stack for cancel/redo
 */
export class CancelStack {
    private stack = [];
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
    push(data: CanvasModificationRectangle): void {
        this.currentIndex++;
        this.stack[this.currentIndex] = data;
        this.n = this.currentIndex + 1;
    }


    back(): CanvasModificationRectangle {
        if (this.currentIndex <= 0)
            return this.stack[this.currentIndex];

        this.currentIndex--;
        return this.stack[this.currentIndex];
    }

    forward(): CanvasModificationRectangle {
        if (this.currentIndex >= this.n - 1)
            return this.stack[this.currentIndex];

        this.currentIndex++;
        return this.stack[this.currentIndex];
    }


    /**
     * @returns the top of the stack
     */
    top(): CanvasModificationRectangle {
        return this.stack[this.currentIndex];
    }
}
