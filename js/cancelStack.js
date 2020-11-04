/**
 * data structure stack for cancel/redo
 */
class CancelStack {
    stack = [];
    currentIndex = -1;
    n = 0;

    /**
     * empty the stack
     */
    clear() {
        this.stack = [];
        this.currentIndex = -1;
        this.n = 0;
    }

    /**
     * 
     * @param {*} data 
     */
    push(data) {
        this.currentIndex++;
        this.stack[this.currentIndex] = data;
        this.n = this.currentIndex + 1;
    }


    back() {
        if (this.currentIndex <= 0)
            return this.stack[this.currentIndex];

        this.currentIndex--;
        return this.stack[this.currentIndex];
    }

    forward() {
        if (this.currentIndex >= this.n - 1)
            return this.stack[this.currentIndex];

        this.currentIndex++;
        return this.stack[this.currentIndex];
    }

}