import { AnimationToolBar } from './AnimationToolBar';
import { OperationDeleteSeveralActions } from './OperationDeleteSeveralActions';
import { OperationMoveSevActions } from './OperationMoveSeveralActions';
import { BoardManager } from './boardManager';


export class SelectionActions {
    selection: Set<number> = new Set();


    get isEmpty(): boolean { return this.selection.size == 0; }

    has(i: number): boolean { return this.selection.has(i) }

    clear(): void {
        this.selection.clear();
    }


    addInterval(from: number, to: number): void {
        for (let k = from; k <= to; k++)
            this.selection.add(k);
    }


    private min() { return Math.min(...this.selection); }
    private max() { return Math.max(...this.selection); }

    private makeContiguous(): void {
        const min = this.min();
        const max = this.max();

        for (let i = min; i <= max; i++)
            this.selection.add(i);
    }


    contiguousAdd(t: number): void {
        this.selection.add(t);
        this.makeContiguous();
    }

    includesInterval(from: number, to: number): boolean {
        for (let k = from; k <= to; k++)
            if (!this.selection.has(k))
                return false;
        return true;
    }
    add(k: number): void {
        this.selection.add(k);
    }



    get indicesArray(): number[] {
        return Array.from(this.selection).sort();
    }

    delete(): void {
        BoardManager.executeOperation(new OperationDeleteSeveralActions(this.indicesArray));
        this.selection.clear();
        AnimationToolBar.update();
    }


    moveTo(dest: number): void {
        BoardManager.executeOperation(new OperationMoveSevActions(this.indicesArray, dest));
        this.selection.clear();
        AnimationToolBar.update();
    }
}