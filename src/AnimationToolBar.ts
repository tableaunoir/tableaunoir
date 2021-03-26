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



    static toggle(): void {
        if (!document.getElementById("buttonMovieMode").hidden) {
            document.getElementById("animationToolBar").hidden = !document.getElementById("animationToolBar").hidden;
            if (document.getElementById("animationToolBar").hidden)
                document.getElementById("buttonMovieMode").classList.remove("buttonselected");
            else
                document.getElementById("buttonMovieMode").classList.add("buttonselected");
            AnimationToolBar.update();
        }

    }
    /**
     * hide forever the animation mode (because there is no animation mode when the Tableau is shared, at least for the moment)
     */
    static hideForever(): void {
        document.getElementById("animationToolBar").hidden = true;
        document.getElementById("buttonMovieModeKey").hidden = true;
        document.getElementById("buttonMovieMode").hidden = true;
    }


    /**
     * @returns true if we are in the animation mode
     */
    static is(): boolean { return !document.getElementById("animationToolBar").hidden; }

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

        if (action.pause)
            el.classList.add("actionPause");

        if (t <= BoardManager.cancelStack.getCurrentIndex())
            el.classList.add("actionExecuted");

        el.draggable = true;

        el.ondrag = () => {
            AnimationToolBar.tSelected = t;
            AnimationToolBar.dragAndDropFrames = true;
        }

        el.ondragend = () => { AnimationToolBar.dragAndDropFrames = false; };

        el.onclick = () => {
            BoardManager.cancelStack.setCurrentIndex(t);
            for (let i = 0; i <= BoardManager.cancelStack.actions.length - 1; i++)
                if (i <= t)
                    document.getElementById("animationActionList").children[i].classList.add("actionExecuted")
                else
                    document.getElementById("animationActionList").children[i].classList.remove("actionExecuted");
            //AnimationToolBar.update();
        };

        el.ondrop = () => {
            console.log(`move(${AnimationToolBar.tSelected}, ${t})`)
            BoardManager.cancelStack.move(AnimationToolBar.tSelected, t);
            AnimationToolBar.update();

        }

        el.ondblclick = () => {
            console.log('toggle pause');
            action.pause = !action.pause;
            AnimationToolBar.update();
        }

        return el;
    }
}