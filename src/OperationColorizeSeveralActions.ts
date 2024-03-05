import { BoardManager } from "./boardManager";
import { Action } from "./Action";
import { Operation } from "./Operation";
import { ActionFreeDraw } from "./ActionFreeDraw";
import { AnimationToolBar } from "./AnimationToolBar";



/**
 * @description recolorize actions, i.e. change the color of the selected actions. If some actions have no color (like ActionErase)
 * this operation does nothing (technically it assigns a fake non-used property "color")
 */
export class OperationColorizeSeveralActions extends Operation {
    private previousColors: string[];

    /**
     * 
     * @param indices the indices of the actions to be recolorized
     * @param newColor new color to assign to the actions
     */
    constructor(private indices: number[], private newColor: string) {
        super();
        this.previousColors = this.indices.map(index => this.getColor(BoardManager.timeline.actions[index]));
    }

    /**
     * 
     * @param action 
     * @param color 
     * @returns set the color of the action
     */
    private setColor(action: Action, color: string) {
        if (action instanceof ActionFreeDraw)
            action.setColor(color);
        else
            (<any>action).color = color;
    }

    /**
     * 
     * @param action 
     * @returns the color of the action
     * 
     */
    private getColor(action: Action) {
        if (action instanceof ActionFreeDraw)
            return action.getMainColor();
        else return (<any>action).color;
    }

    undo(): void {
        for (const i in this.indices)
            this.setColor(BoardManager.timeline.actions[this.indices[i]], this.previousColors[i]);
        BoardManager.timeline.resetAndUpdate();
        AnimationToolBar.update();
    }


    async redo(): Promise<void> {
        for (const i in this.indices)
            this.setColor(BoardManager.timeline.actions[this.indices[i]], this.newColor);
        BoardManager.timeline.resetAndUpdate();
        AnimationToolBar.update();
    }
}