import { ActionErase } from './ActionErase';
import { ActionFreeDraw } from './ActionFreeDraw';
import { BoardManager } from './boardManager';


export class AnimationToolBar {


    static iSelected = 0;
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


    static update(): void {
        if (document.getElementById("animationToolBar").hidden)
            return;

        document.getElementById("animationActionList").innerHTML = "";

        for (let i = 0; i < BoardManager.cancelStack.actions.length; i++) {
            document.getElementById("animationActionList").append(AnimationToolBar.HTMLElementForAction(i));
        }

        document.getElementById("canvas").ondrop = () => {
            if (AnimationToolBar.dragAndDropFrames) {
                BoardManager.cancelStack.delete(AnimationToolBar.iSelected);
                AnimationToolBar.update();
            }
            AnimationToolBar.dragAndDropFrames = false;

        };
    }


    static HTMLElementForAction(i: number): HTMLElement {
        const action = BoardManager.cancelStack.actions[i];
        const el = document.createElement("div");
        el.classList.add("action");

        if (action instanceof ActionFreeDraw)
            el.style.backgroundColor = action.getMainColor();
        else if (action instanceof ActionErase)
            el.classList.add("actionErase");

        if (i <= BoardManager.cancelStack.getCurrentIndex())
            el.classList.add("actionExecuted");

        el.draggable = true;

        el.ondrag = () => {
            AnimationToolBar.iSelected = i;
            AnimationToolBar.dragAndDropFrames = true;
        }

        el.ondragend = () => {AnimationToolBar.dragAndDropFrames = false;};
        
        el.onclick = () => {
            BoardManager.cancelStack.setCurrentIndex(i);
            AnimationToolBar.update();
        };

        el.ondrop = () => {
            console.log(`move(${AnimationToolBar.iSelected}, ${i})`)
            BoardManager.cancelStack.move(AnimationToolBar.iSelected, i);
            AnimationToolBar.update();

        }
        return el;
    }
}