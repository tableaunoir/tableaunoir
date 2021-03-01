import { ActionErase } from './ActionErase';
import { ActionFreeDraw } from './ActionFreeDraw';
import { BoardManager } from './boardManager';


export class AnimationToolBar {

    /**
     * the selection action timestep
     */
    static tSelected = 0;

    /**
     * true iff there are some frames (i.e. actions) that are drag and dropped
     */
    static dragAndDropFrames = false;

    /**
     * hide forever the animation mode
     */
    static hideForever(): void {
        document.getElementById("animationToolBar").hidden = true;
        document.getElementById("buttonMovieMode").hidden = true;
    }


    /**
     * @returns true if we are in the animation mode
     */
    static is(): boolean {
        return !document.getElementById("animationToolBar").hidden;
    }

    /**
     * @description updates the whole timeline
     */
    static update(): void {
        if (document.getElementById("animationToolBar").hidden)
            return;

        document.getElementById("animationActionList").innerHTML = "";

        for (let i = 0; i < BoardManager.cancelStack.actions.length; i++) {
            document.getElementById("animationActionList").append(AnimationToolBar.HTMLElementForAction(i));
        }

        document.getElementById("canvas").ondrop = () => {
            if (AnimationToolBar.dragAndDropFrames) {
                BoardManager.cancelStack.delete(AnimationToolBar.tSelected);
                AnimationToolBar.update();
            }
            AnimationToolBar.dragAndDropFrames = false;

        };
    }

    /**
     * 
     * @param t 
     * @returns an HTML element (a small square) that represents the action
     */
    static HTMLElementForAction(t: number): HTMLElement {
        const action = BoardManager.cancelStack.actions[t];
        const el = document.createElement("div");
        el.classList.add("action");

        if (action instanceof ActionFreeDraw)
            el.style.backgroundColor = action.getMainColor();
        else if (action instanceof ActionErase)
            el.classList.add("actionErase");

        if (t <= BoardManager.cancelStack.getCurrentIndex())
            el.classList.add("actionExecuted");

        el.draggable = true;

        el.ondrag = () => {
            AnimationToolBar.tSelected = t;
            AnimationToolBar.dragAndDropFrames = true;
        }

        el.ondragend = () => {AnimationToolBar.dragAndDropFrames = false;};
        
        el.onclick = () => {
            BoardManager.cancelStack.setCurrentIndex(t);
            AnimationToolBar.update();
        };

        el.ondrop = () => {
            console.log(`move(${AnimationToolBar.tSelected}, ${t})`)
            BoardManager.cancelStack.move(AnimationToolBar.tSelected, t);
            AnimationToolBar.update();

        }
        return el;
    }
}