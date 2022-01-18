import { BoardManager } from './boardManager';
import { Operation } from "./Operation";
import { AnimationToolBar } from "./AnimationToolBar";

/**
 * add a specific action (draw a line, erase, etc.) at time t
 */
export class OperationMoveSevActions extends Operation {

	constructor(private indexesTable: number[], private insertIndex: number) { super(); }

	prepareUndo(indexesTable: number[], insertIndex: number): [number, number][] {
		const returnMap: [number, number][] = [];

		for (let i = 0; i < indexesTable.length; i++) {
			returnMap.push([indexesTable[i], insertIndex]);
			if (indexesTable[i] > insertIndex)
				insertIndex++;
		}
		return returnMap;
	}

	prepareRedo(indexesTable: number[], insertIndex: number): [number, number][] {
		const returnMap: [number, number][] = [];

		for (let i = 0; i < indexesTable.length; i++) {
			returnMap.push([indexesTable[i], insertIndex]);
			if (indexesTable[i] > insertIndex)
				insertIndex++;
			else {
				for (let k = i + 1; k < indexesTable.length; k++) {
					if (indexesTable[k] < insertIndex)
						indexesTable[k] = indexesTable[k] - 1;
				}
			}
		}
		return returnMap;
	}


	undo(): void {
		const indexes = this.prepareUndo(this.indexesTable, this.insertIndex);
		for (let k = indexes.length - 1; k > -1; k--) {
			BoardManager.timeline.moveAction(indexes[k][1], indexes[k][0]);
		}
		AnimationToolBar.update(); //to be optimized
	}

	redo(): void {
		const indexes = this.prepareRedo(this.indexesTable, this.insertIndex);
		console.log("nb of indexes: " + indexes.length);
		console.log("indexes: " + indexes);
		for (let k = 0; k < indexes.length; k++) {
			BoardManager.timeline.moveAction(indexes[k][0], indexes[k][1]);
		}
		AnimationToolBar.update(); //to be optimized
	}

}