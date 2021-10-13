/**
 * a binary heap
 */
export class MinHeap {

    private heap: Object[];
    private priority: number[];
    private indices;
    /**
     * @description creates an empty binary heap
     */
    constructor() {
        this.heap = [null];
        this.priority = [null];
        this.indices = {};
    }


    /**
     * 
     * @param {*} element 
     * @returns the hash used to retrieve the element
     */
    hash(element): string { return element.x + "_" + element.y; }

    /**
     * 
     * @param {*} element 
     * @returns the index of the element
     */
    getIndexOfElement(element): number {
        return this.indices[this.hash(element)];
    }



    /**
     * swap the element at position i and j in the heap
     */
    private swap(i: number, j: number): void {
        // console.log(i + " " + j)
        [this.indices[this.hash(this.heap[i])], this.indices[this.hash(this.heap[j])]] = [j, i];
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
        [this.priority[i], this.priority[j]] = [this.priority[j], this.priority[i]];
    }

    /**
     * 
     * @param {*} node 
     * @param {*} priority 
     * @description insert node with priority
     */
    insert(node, priority: number): void {
        if (this.indices[this.hash(node)]) {
            this.decrease(node, priority);
        }
        else {
            this.heap.push(node);
            this.priority.push(priority);

            const last = this.heap.length - 1;
            this.indices[this.hash(node)] = last;

            this.bubbleup(last);
        }

    }

    /**
     * 
     * @param {*} i 
     * @description bubble up
     */
    private bubbleup(i: number): void {
        if (i > 1) {
            const iparent = Math.floor(i / 2);
            if (this.priority[iparent] > this.priority[i]) {
                this.swap(iparent, i);
                this.bubbleup(iparent);
            }
        }

    }

    /**
         * 
         * @param {*} i 
         * @description bubble down
         */
    private bubbledown(i: number): void {
        const left = i * 2

        if (left >= this.priority.length) //no children
            return;

        const right = i * 2 + 1

        let j = i;
        let min = this.priority[i];

        if (right < this.priority.length)
            if (this.priority[right] < min) {
                min = this.priority[right];
                j = right;
            }

        if (this.priority[left] < min) {
            min = this.priority[left];
            j = left;
        }

        if (i < j) {
            this.swap(i, j);
            this.bubbledown(j);
        }

    }

    /**
     * @description remove the most prioritized element
     * /!\ the heap must be non-empty, otherwise: BOUM
     * @returns that element
     */
    remove() {

        const element = this.heap[1]
        this.indices[this.hash(element)] = undefined;

        if (this.heap.length == 2) { // a single element
            this.heap = [null];
            this.priority = [null];
        }
        else {
            const ilast = this.heap.length - 1;
            this.heap[1] = this.heap[ilast]
            this.priority[1] = this.priority[ilast]

            this.heap.splice(this.heap.length - 1)
            this.priority.splice(this.priority.length - 1)

            this.indices[this.hash(this.heap[1])] = 1;
            this.bubbledown(1);
        }
        return element;
    }

    /**
     * @description assigns a new priority (lower) to element
     */
    decrease(element, priority: number): void {
        const i = this.indices[this.hash(element)];
        if (this.priority[i] < priority)
            throw "non-decreasing!";
        this.priority[i] = priority;
        this.bubbleup(i);
    }


    isEmpty(): boolean { return this.heap.length <= 1; }
}


