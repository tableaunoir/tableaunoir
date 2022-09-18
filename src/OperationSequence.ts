import { Operation } from "./Operation";

export class OperationSequence extends Operation {
    private ops: Operation[] = [];

    constructor() {
        super();
    }

    add(op: Operation) {
        this.ops.push(op);
    }



    async undo(): Promise<void> {
        for (let i = this.ops.length - 1; i >= 0; i--)
            await this.ops[i].undo();
    }


    async redo(): Promise<void> {
        for (let i = 0; i < this.ops.length; i++)
            await this.ops[i].redo();
    }
}