import { AnimationToolBar } from './AnimationToolBar';
import { OperationDeleteSeveralActions } from './OperationDeleteSeveralActions';
import { OperationMoveSevActions } from './OperationMoveSeveralActions';
import { BoardManager } from './boardManager';


/**
 * @description represents a selection of actions in the timeline
 */
export class SelectionActions {
    selection: Set<number> = new Set();

    /**
     * @returns true if the selection is empty
     */
    get isEmpty(): boolean { return this.selection.size == 0; }

    /**
     * @returns true if the action at timestep i is in the selection
     */
    has(i: number): boolean { return this.selection.has(i) }

    /** @description makes the selection empty */
    clear(): void { this.selection.clear(); }

    /**
     * 
     * @param from 
     * @param to 
     * @description add all actions whose indices are between from and to (included)
     */
    addInterval(from: number, to: number): void {
        for (let k = from; k <= to; k++)
            this.selection.add(k);
    }

    /**
     * 
     * @returns the min (resp.) max of the indices of actions in the selection
     */
    private get min() { return Math.min(...this.selection); }
    private get max() { return Math.max(...this.selection); }

    /**
     * @description fill in the holes to make the selection contiguous (an interval)
     */
    private makeContiguous(): void {
        for (let i = this.min; i <= this.max; i++)
            this.selection.add(i);
    }

    /**
     * 
     * @param t 
     * @description add action at timestep t to the selection. Makes the selection contiguous (i.e. an interval)
     */
    contiguousAdd(t: number): void {
        this.selection.add(t);
        this.makeContiguous();
    }

    /**
     * @returns true if the full interval [from, to] is included in the selection
     */
    includesInterval(from: number, to: number): boolean {
        for (let k = from; k <= to; k++)
            if (!this.selection.has(k))
                return false;
        return true;
    }

    /**
     * 
     * @param k 
     * @description add action at timestep k to the selection
     */
    add(k: number): void { this.selection.add(k); }

    /**
     * @returns the sorted (in the increasing order) array of the indices of the selected actions 
     */
    private get indicesArray(): number[] { return Array.from(this.selection).sort(); }

    /**
     * @description delete the selected actions
     */
    delete(): void {
        BoardManager.executeOperation(new OperationDeleteSeveralActions(this.indicesArray));
        this.selection.clear();
        AnimationToolBar.update();
    }

    /**
     * @description move the selected actions to time t
    */
    moveTo(dest: number): void {
        BoardManager.executeOperation(new OperationMoveSevActions(this.indicesArray, dest));
        this.selection.clear();
        AnimationToolBar.update();
    }
}