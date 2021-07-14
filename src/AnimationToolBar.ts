import { Layout } from './Layout';
import { ActionTimeLineMenu } from './ActionTimeLineMenu';
import { OperationDeleteAction } from './OperationDeleteAction';
import { OperationDeleteSeveralActions } from './OperationDeleteSeveralActions';
import { OperationMoveAction } from './OperationMoveAction';
import { OperationMoveSevActions } from './OperationMoveSeveralActions';
import { BoardManager } from './boardManager';

/**
 * this class handles the toolbar at the bottom for the animation
 */
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
     * used to remember the folded div the user is currently working one
     * foldedIndices[i] = true iff the ith action is pause and the corresponding slide is unfolded
     */
    static foldIndexes: number[] = [];
    static selectedActionIndices: number[] = [];
    static shiftSelectIndex = -1;   //starting index for shift selection
    static nbActions = 0;   //number of actions still displayed in the bottom toolbar (can be different from timeline.actions.length until update)

    /**
     * toggles the display of the animation toolbar
     */
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
     * @param the index n of the action in the history
     *
     * @returns the element of animationActionList corresponding to the n-th action
     *
     */
    static getActionElement(n: number): HTMLElement {
        let currIndex = 0;

        //browse the timeline toolbar
        for (let i = 0; i < document.getElementById("animationActionList").children.length; i++) {

            //if it is a "directory"
            if (document.getElementById("animationActionList").children[i].classList.contains("foldedDiv")) {
                const len = document.getElementById("animationActionList").children[i].children.length;
                if (n > currIndex + len - 1) {
                    currIndex += len;
                }
                else {
                    return document.getElementById("animationActionList").children[i].children[n - currIndex] as HTMLElement;
                }
            }
            //if it is an action
            else if (document.getElementById("animationActionList").children[i].classList.contains("action")) {
                if (currIndex == n)
                    return document.getElementById("animationActionList").children[i] as HTMLElement;
                currIndex++;
            }
        }
    }

    /*
     * @param the index n of the pause action corresponding to the slide
     * @returns a new division that will contain all sub-actions coming before a pause one
     */
    static spawnFoldDiv(n: number): HTMLElement {
        const el = document.createElement("div");
        el.id = "foldedDiv" + n;
        el.classList.add("foldedDiv");
        return el;
    }

    /*
     * @param the index of the pause action corresponding to the slide
     * @returns a new label controlling an invisible checkBox
     */
    static spawnFoldLabel(n: number): HTMLElement {
        const el = document.createElement("label");
        el.htmlFor = "toggleSub" + n;
        el.classList.add("unfold");
        const index = AnimationToolBar.foldIndexes.indexOf(n);
        if (index == -1)
            el.style.backgroundImage = "url(\"img/open.png\")";
        else
            el.style.backgroundImage = "url(\"img/close.png\")";
        el.onclick = () => {
            if (index == -1)
                AnimationToolBar.foldIndexes.push(n);
            else
                AnimationToolBar.foldIndexes.splice(index, 1);
            el.style.backgroundImage = (el.style.backgroundImage == "url(\"img/open.png\")" ? "url(\"img/close.png\")"
                : "url(\"img/open.png\")");
        }
        return el;
    }

    /*
     * @param the index of the pause action corresponding to the slide
     * @returns a new checkbox controlling the visibility of the next folded actions div
     */
    static spawnFoldCheckBox(n: number): HTMLElement {
        const el = document.createElement("input");
        el.id = "toggleSub" + n;
        if (AnimationToolBar.foldIndexes.indexOf(n) != -1)
            el.checked = true;
        el.classList.add("toggleFOld");
        el.type = "checkbox";
        return el;
    }


    /** 
     * @description update the timeline toolbar given that the indices are those that are deleted 
     **/
    static updateDelete(indices: number[]): void {
        if (!AnimationToolBar.is())
            return;

        if (indices.length != 0) {
            console.log("indices : " + indices);
            console.log("actions amount : " + AnimationToolBar.nbActions);
            for (let k = indices.length - 1; k > -1; k--) {
                let element = AnimationToolBar.getActionElement(indices[k]);
                console.log("removed element : " + element);
                console.log("element's index : " + element.dataset.index);
                element.remove();
                AnimationToolBar.nbActions--;
                for (let n = indices[k]; n < AnimationToolBar.nbActions; n++) {
                    element = AnimationToolBar.getActionElement(n);
                    console.log("element to modify : " + element);
                    element.dataset.index = (+element.dataset.index - 1).toString();
                }
            }
        }
    }









    /**
     * 
     * @param index 
     * @description update the timeline bar given that there was only the insertion of action at index that have been produced
     */
    static updateAddAction(index: number): void {
        if (!AnimationToolBar.is())
            return;

        console.log("updateAddAction at index:" + index);
        console.log("pb actions: " + AnimationToolBar.nbActions);
        for (let n = index; n < AnimationToolBar.nbActions; n++) {
            const element = AnimationToolBar.getActionElement(n);
            console.log("element to modify : " + element);
            element.dataset.index = (+element.dataset.index + 1).toString();
        }
        const elementToInsert = AnimationToolBar.createHTMLElementForAction(index);
        const elementBefore = AnimationToolBar.getActionElement(index - 1);
        if (elementBefore.parentElement.classList.contains("ActionPause")){
            //TODO: improve to handle the label+checkbox
            (<HTMLDivElement>elementBefore.nextSibling).prepend(elementToInsert);
        }
            
        else
            elementBefore.insertAdjacentElement('afterend', elementToInsert);
        AnimationToolBar.nbActions++;

    }




    /**
     * @description update the fact that the current index has changed
     */
    static updateCurrentIndex(): void {
        if (!AnimationToolBar.is())
            return;

        const currentIndex = BoardManager.timeline.getCurrentIndex();
        for (let i = 1; i < BoardManager.timeline.actions.length; i++) {
            const elem = AnimationToolBar.getActionElement(i);
            if (i <= currentIndex)
                elem.classList.add("actionExecuted");
            else
                elem.classList.remove("actionExecuted");
        }
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

        document.getElementById("animationActionList").append(AnimationToolBar.createHTMLElementForAction(0));

        for (let i = 1; i < BoardManager.timeline.actions.length; i++) {
            if (BoardManager.timeline.actions[i].pause) {

                const lab = AnimationToolBar.spawnFoldLabel(count);

                const checkBox = AnimationToolBar.spawnFoldCheckBox(count);

                if (foldedDiv.innerHTML != "") {
                    document.getElementById("animationActionList").append(lab);
                    document.getElementById("animationActionList").append(checkBox);
                }
                document.getElementById("animationActionList").append(foldedDiv);
                document.getElementById("animationActionList").append(AnimationToolBar.createHTMLElementForAction(i));
                count++;

                document.getElementById("animationBarBuffer").innerHTML = "";
                foldedDiv = AnimationToolBar.spawnFoldDiv(count);
                document.getElementById("animationBarBuffer").append(foldedDiv);
            }
            else {
                document.getElementById("foldedDiv" + count).append(AnimationToolBar.createHTMLElementForAction(i));
            }
        }
        document.getElementById("animationActionList").append(foldedDiv);

        document.getElementById("canvas").ondrop = () => {
            if (AnimationToolBar.dragAndDropFrames) {
                AnimationToolBar.nbActions = BoardManager.timeline.actions.length;
                if (AnimationToolBar.selectedActionIndices.length != 0) {
                    AnimationToolBar.selectedActionIndices.sort((x, y) => x - y);
                    if (AnimationToolBar.selectedActionIndices[0] == 0)
                        AnimationToolBar.selectedActionIndices.splice(0, 1);
                    BoardManager.executeOperation(new OperationDeleteSeveralActions(AnimationToolBar.selectedActionIndices));
                    AnimationToolBar.updateDelete(AnimationToolBar.selectedActionIndices);
                    AnimationToolBar.selectedActionIndices = [];
                    AnimationToolBar.shiftSelectIndex = -1;
                }
                else if (AnimationToolBar.tSelected != 0) {
                    BoardManager.executeOperation(new OperationDeleteAction(AnimationToolBar.tSelected));
                    AnimationToolBar.selectedActionIndices.push(AnimationToolBar.tSelected);
                    AnimationToolBar.updateDelete(AnimationToolBar.selectedActionIndices);
                    AnimationToolBar.selectedActionIndices = [];
                }
            }
            AnimationToolBar.dragAndDropFrames = false;
        }
    }

    /**
     *
     * @param t
     * @returns an HTML element (a small square) that represents the action
     */
    static createHTMLElementForAction(t: number): HTMLElement {
        const action = BoardManager.timeline.actions[t];
        const el = document.createElement("div");

        el.dataset.index = t.toString();

        el.classList.add("action");
        el.style.backgroundImage = action.getOverviewImage();

        if (action.pause)
            el.classList.add("actionPause");

        if (!action.isBlocking)
            el.classList.add("actionParallel");

        if (t <= BoardManager.timeline.getCurrentIndex())
            el.classList.add("actionExecuted");

        el.draggable = true;

        el.ondrag = () => {
            AnimationToolBar.tSelected = +el.dataset.index;
            console.log("drag index :  " + AnimationToolBar.tSelected);
            AnimationToolBar.dragAndDropFrames = true;
        }

        document.addEventListener("keydown", function (event) {
            if (event.key == "Escape") {
                AnimationToolBar.deselect();
            }
        });

        el.oncontextmenu = (evt) => {
            const menu = new ActionTimeLineMenu(action);
            menu.show({ x: Layout.getXMiddle(), y: 800 });
            evt.preventDefault();
            return;
        }

        el.ondragend = () => { AnimationToolBar.dragAndDropFrames = false; };

        el.onclick = (event) => {
            const selectMode = (event.ctrlKey);
            const selectModeShift = (event.shiftKey);

            if (selectMode) {
                const index = AnimationToolBar.selectedActionIndices.indexOf(+el.dataset.index);
                if (el.classList.contains("actionSelected")) {
                    AnimationToolBar.selectedActionIndices.splice(index, 1);
                    el.classList.remove("actionSelected");
                    if (action.pause) {
                        const pauseElement = AnimationToolBar.getActionElement(+el.dataset.index);
                        const elsToRemove = pauseElement.previousSibling as HTMLElement;
                        for (let k = 0; k < elsToRemove.children.length; k++) {
                            elsToRemove.children[k].classList.remove("actionSelected");
                        }
                        AnimationToolBar.selectedActionIndices.splice(index, elsToRemove.children.length);
                    }
                }
                else {
                    AnimationToolBar.selectedActionIndices.push(+el.dataset.index);
                    el.classList.add("actionSelected");
                    if (action.pause) {
                        const pauseElement = AnimationToolBar.getActionElement(+el.dataset.index);
                        const elsToAdd = pauseElement.previousSibling as HTMLElement;
                        for (let k = 0; k < elsToAdd.children.length; k++) {
                            elsToAdd.children[k].classList.add("actionSelected");
                            AnimationToolBar.selectedActionIndices.push(+el.dataset.index - (k + 1));
                        }
                    }
                }
            }
            else if (selectModeShift) {
                if (AnimationToolBar.shiftSelectIndex == -1) {
                    AnimationToolBar.shiftSelectIndex = +el.dataset.index;
                    AnimationToolBar.selectedActionIndices.push(+el.dataset.index);
                    el.classList.add("actionSelected");
                }
                else if (AnimationToolBar.shiftSelectIndex != -1) {
                    if (t < AnimationToolBar.shiftSelectIndex) {
                        AnimationToolBar.selectedActionIndices.push(+el.dataset.index);
                        el.classList.add("actionSelected");
                        for (let k = +el.dataset.index + 1; k < AnimationToolBar.shiftSelectIndex; k++) {
                            AnimationToolBar.selectedActionIndices.push(k);
                            AnimationToolBar.getActionElement(k).classList.add("actionSelected");
                        }
                    }
                    else if (+el.dataset.index > AnimationToolBar.shiftSelectIndex) {
                        AnimationToolBar.selectedActionIndices.push(+el.dataset.index);
                        el.classList.add("actionSelected");
                        for (let k = AnimationToolBar.shiftSelectIndex + 1; k < +el.dataset.index; k++) {
                            AnimationToolBar.selectedActionIndices.push(k);
                            AnimationToolBar.getActionElement(k).classList.add("actionSelected");
                        }
                    }
                }
            }
            else {
                if (!AnimationToolBar.isSelected(+el.dataset.index))
                    AnimationToolBar.deselect();
                BoardManager.timeline.setCurrentIndex(+el.dataset.index);
                AnimationToolBar.updateCurrentIndex();
            }
        }

        el.ondrop = () => {
            if (AnimationToolBar.selectedActionIndices.length == 0) {
                BoardManager.executeOperation(new OperationMoveAction(AnimationToolBar.tSelected, +el.dataset.index));
            } else {
                AnimationToolBar.selectedActionIndices.sort((x, y) => x - y);
                BoardManager.executeOperation(new OperationMoveSevActions(AnimationToolBar.selectedActionIndices, +el.dataset.index));
            }
            AnimationToolBar.selectedActionIndices = [];
            AnimationToolBar.shiftSelectIndex = -1;
            AnimationToolBar.update();
        }

        el.ondblclick = () => {
            console.log('toggle pause');
            action.pause = !action.pause;
            AnimationToolBar.update();
        }

        return el;
    }


    /**
     * deselect all actions
     */
    static deselect(): void {
        for (let k = 0; k < AnimationToolBar.selectedActionIndices.length; k++) {
            const element = AnimationToolBar.getActionElement(AnimationToolBar.selectedActionIndices[k]);
            element.classList.remove("actionSelected");
        }
        AnimationToolBar.shiftSelectIndex = -1;
        AnimationToolBar.selectedActionIndices = [];
    }

    /**
     * 
     * @param t 
     * @returns true if action at time t is selected
     */
    static isSelected(t: number): boolean {
        return AnimationToolBar.selectedActionIndices.indexOf(t) >= 0;
    }
    /**
     * 
     * @returns true iff there is a selection
     */
    static isSelection(): boolean {
        return AnimationToolBar.selectedActionIndices.length > 0;
    }
}
