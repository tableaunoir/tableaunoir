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

    /*
     * used to remember the golded div the user is currently working one
     */
    static currFoldIndex = -1;


    static toggle(): void {
        if (!document.getElementById("buttonMovieMode").hidden) {
            document.getElementById("animationToolBar").style.display = AnimationToolBar.is() ? "none" : "";
            if (AnimationToolBar.is())
                document.getElementById("buttonMovieMode").classList.add("buttonselected");
            else
                document.getElementById("buttonMovieMode").classList.remove("buttonselected");
            AnimationToolBar.update();
        }

    }

    /**
     * hide forever the animation mode (because there is no animation mode when the Tableau is shared, at least for the moment)
     */
    static hideForever(): void {
        document.getElementById("animationToolBar").style.display = "none";
        document.getElementById("buttonMovieModeKey").style.display = "none";
        document.getElementById("buttonMovieMode").hidden = true;
    }


    /**
     * @returns true if we are in the animation mode
     */
    static is(): boolean { return document.getElementById("animationToolBar").style.display == ""; }

    /*
     * @param the index of the action in the cancelStack
     *
     * @returns a pair of indexes, the first one refers to the direct children of animationToolBar the action is in, the
     * second one refers to the index of the folded div the action is in (-1 if not in one).
     * Will return (-1, -1) in case of failure.
     */
    static WhereAmI (n: number) : [number, number]{
        let fst = 0;
        let snd = -1;
        let currIndex = 0;

        for(let i = 0; i <= document.getElementById("animationActionList").children.length; i++){
            if(document.getElementById("animationActionList").children[i].classList.contains("unfold")){
                i+=2;
                let currFoldedDiv = document.getElementById("animationActionList").children[i].children;
                if(n > currIndex + currFoldedDiv.length){
                    currIndex += currFoldedDiv.length;
                }
                else if(n == currIndex + currFoldedDiv.length){
                    fst = i+1;
                    return [fst, snd];
                }else{
                    fst = i;
                    snd = n - currIndex;
                    return [fst, snd];
                }
            }
            else if(n == currIndex){
                fst = i;
                return [fst, snd];
            }else
                currIndex ++;
        }
        return [-1, -1];
    }

    /*
     * @returns a division containing all sub-actions coming before a pause one
     */
    static spawnFoldDiv(n: number): HTMLElement {
        const el = document.createElement("div");
        el.id = "foldedDiv" + n;
        el.classList.add("foldedDiv");
        return el;
    }

    /*
     * @returns a label controlling an invisible checkBox
     */
    static spawnFoldLabel(n: number): HTMLElement {
        const el = document.createElement("label");
        el.htmlFor = "toggleSub" + n;
        el.classList.add("unfold");
        el.style.backgroundImage = "url(\"img/open.png\")";
        el.onclick = () =>
        {
            AnimationToolBar.currFoldIndex = (AnimationToolBar.currFoldIndex == n ? -1 : n);

            el.style.backgroundImage = (el.style.backgroundImage == "url(\"img/open.png\")" ?  "url(\"img/close.png\")"
            : "url(\"img/open.png\")");
        }
        return el;
    }

    /*
     * @returns a checkbox controlling the visibility of the next folded actions div
     */
    static spawnFoldCheckBox(n: number): HTMLElement {
        const el = document.createElement("input");
        el.id = "toggleSub" + n;
        if(AnimationToolBar.currFoldIndex == n)
            el.checked = true;
        el.classList.add("toggleFOld");
        el.type = "checkbox";
        return el;
    }

    /**
     * @description updates the whole timeline
     */
    static update(): void {
        if (!AnimationToolBar.is())
            return;

        let count = 0;  //used to spawn the html elements needed for the folding system


        let foldedDiv = AnimationToolBar.spawnFoldDiv(count);
        document.getElementById("animationActionList").innerHTML = "";
        document.getElementById("animationBarBuffer").append(foldedDiv);

        for (let i = 0; i < BoardManager.cancelStack.actions.length; i++) {
            if (BoardManager.cancelStack.actions[i].pause) {

                const lab = AnimationToolBar.spawnFoldLabel(count);

                const checkBox = AnimationToolBar.spawnFoldCheckBox(count);

                if (foldedDiv.innerHTML != "") {
                    document.getElementById("animationActionList").append(lab);
                    document.getElementById("animationActionList").append(checkBox);
                }
                document.getElementById("animationActionList").append(foldedDiv);
                document.getElementById("animationActionList").append(AnimationToolBar.HTMLElementForAction(i));
                count++;

                document.getElementById("animationBarBuffer").innerHTML = "";
                foldedDiv = AnimationToolBar.spawnFoldDiv(count);
                document.getElementById("animationBarBuffer").append(foldedDiv);
            }
            else
                document.getElementById("foldedDiv" + count).append(AnimationToolBar.HTMLElementForAction(i));
        }
        document.getElementById("animationActionList").append(foldedDiv);

        document.getElementById("canvas").ondrop = () => {
            if (AnimationToolBar.dragAndDropFrames) {
                BoardManager.cancelStack.delete(AnimationToolBar.tSelected);
                AnimationToolBar.update();
            }
            AnimationToolBar.dragAndDropFrames = false;
        }
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
        el.style.background = action.getOverviewImage();
        /*if (action instanceof ActionFreeDraw)
            el.style.backgroundColor = action.getMainColor();
        else if (action instanceof ActionErase)
            el.classList.add("actionErase");*/

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
            for (let i = 0; i < BoardManager.cancelStack.actions.length; i++)
            {
                let pos = AnimationToolBar.WhereAmI(i);
                if (i <= t)
                {
                    if(pos[1] == -1)
                        document.getElementById("animationActionList").children[pos[0]].classList.add("actionExecuted");
                    else
                        document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.add("actionExecuted");
                }
                else
                {
                    if(pos[1] == -1)
                        document.getElementById("animationActionList").children[pos[0]].classList.remove("actionExecuted");
                    else
                        document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.remove("actionExecuted");
                }
                //AnimationToolBar.update();
            }
        }

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