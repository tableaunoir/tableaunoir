import { Layout } from './Layout';
import { ActionTimeLineMenu } from './ActionTimeLineMenu';
import { OperationDeleteAction } from './OperationDeleteAction';
import { OperationDeleteSeveralActions } from './OperationDeleteSeveralActions';
import { OperationMoveAction } from './OperationMoveAction';
import { OperationMoveSevActions } from './OperationMoveSeveralActions';
import { BoardManager } from './boardManager';
import { OperationPauseAction } from './OperationPauseAction';

/**
 * this class handles the toolbar at the bottom for the animation
 */
export class AnimationToolBar {
    static updateActionPause(t: number): void {
        if (!this.is())
            return;

        const el = AnimationToolBar.getActionElement(t);
        if (BoardManager.timeline.actions[t].pause) {
            el.classList.add("actionPause");
            this.slideCut(el);
        }
        else {
            el.classList.remove("actionPause");
            this.slideMerge(el);
        }
            
    }

    static currentIndex = 0;

    /**
     * the selection action timestep
     */
    static tSelected = 0;

    /**
     * true iff there are some frames (i.e. actions) that are drag and dropped
     */
    static dragAndDropFrames = false;


    static actionElements = undefined;

    /*
     * used to remember the folded div the user is currently working one
     * foldedIndices[i] = true iff the ith action is pause and the corresponding slide is unfolded
     */
    static foldIndexes: number[] = [];
    static selectedActionIndices: number[] = [];
    static shiftSelectIndex = -1;   //starting index for shift selection

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
     * @param the index t of the action in the history
     *
     * @returns the element of animationActionList corresponding to the t-th action
     *
     */
    static getActionElement(t: number): HTMLElement { return AnimationToolBar.actionElements[t]; }



    /*
     * @returns a new slide that will contain all actions of the slide
     */
    static createSlideDiv(): HTMLElement {
        const slide = document.createElement("div");
        slide.classList.add("slide");
        slide.classList.add("folded");
        slide.appendChild(AnimationToolBar.createFoldButton());
        return slide;
    }

    /*
     * @returns a button that will be in slide and that will toggle the fold/unfoldness of the slide
     */
    static createFoldButton(): HTMLElement {
        const el = document.createElement("div");
        el.onclick = () => el.parentElement.classList.toggle("folded");
        return el;
    }



    /**
     * 
     * @param t 
     * @returns update and take into account that the action n° t has been removed
     */
    static updateDeleteAction(t: number): void {
        if (!AnimationToolBar.is())
            return;

        const elementToRemove = AnimationToolBar.getActionElement(t);
        console.log("removed element: " + elementToRemove);
        console.log("element's index: " + elementToRemove.dataset.index);

        if (elementToRemove.classList.contains("actionPause")) {
            this.slideMerge(elementToRemove);
        }

        elementToRemove.remove();
        for (let n = t + 1; n < BoardManager.timeline.nbActions + 1; n++) {
            const elementToShift = AnimationToolBar.getActionElement(n);
            console.log("element to modify: " + elementToShift);
            elementToShift.dataset.index = (+elementToShift.dataset.index - 1).toString();
            AnimationToolBar.actionElements[n - 1] = AnimationToolBar.actionElements[n];
        }

    }

    /**
     * merge the slide containing the current element with the next slide
     */
    static slideMerge(el: HTMLElement): void {
        const slide = el.parentElement;
        const nextSlide = slide.nextElementSibling;
        if (nextSlide) {
            nextSlide.removeChild(nextSlide.firstChild);//remove the button;
            while (nextSlide.childNodes.length > 0) {
                slide.appendChild(nextSlide.childNodes[0]);
            }
            nextSlide.remove();
        }

    }

    /**
     * cut the slide containing el at el. el remains in the first slide
     */
    static slideCut(el: HTMLElement): void {
        const slide = el.parentElement;
        const nextSlide = this.createSlideDiv();
        while (el.nextSibling) {
            nextSlide.append(el.nextSibling);
        }
        slide.insertAdjacentElement('afterend', nextSlide);

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
        for (let n = BoardManager.timeline.nbActions - 2; n >= index; n--) {
            const element = AnimationToolBar.getActionElement(n);
            element.dataset.index = (+element.dataset.index + 1).toString();
            this.actionElements[n + 1] = AnimationToolBar.actionElements[n];
        }

        const elementToInsert = this.createActionElement(index);
        this.actionElements[index] = elementToInsert;
        const elementBefore = this.getActionElement(index - 1);

        /*console.log("element just before:");
        console.log(elementBefore);*/

        if (index == 1) {
            if (this.animationActionList.children.length == 1) {
                const slide = this.createSlideDiv();
                console.log("there is not slide, I create one...")
                slide.appendChild(elementToInsert);
                this.animationActionList.appendChild(slide);

            }
            else {
                const slide = this.animationActionList.children[1];
                console.log("I go to the slide 1:", slide);
                slide.children[0].insertAdjacentElement('afterend', elementToInsert);
            }
        }
        else if (elementBefore.classList.contains("actionPause")) {
            if (elementBefore.parentElement.nextElementSibling) {
                const slide = elementBefore.parentElement.nextElementSibling;
                slide.children[0].insertAdjacentElement('afterend', elementToInsert);
            }
            else {
                const slide = this.createSlideDiv();
                slide.appendChild(elementToInsert);
                elementBefore.parentElement.insertAdjacentElement('afterend', slide);
            }
        }
        else
            elementBefore.insertAdjacentElement('afterend', elementToInsert);

    }




    /**
     * @description update the fact that the current index has changed
     */
    static updateCurrentIndex(): void {
        AnimationToolBar.currentIndex = BoardManager.timeline.getCurrentIndex();
        if (!AnimationToolBar.is())
            return;

        const currentIndex = BoardManager.timeline.getCurrentIndex();
        for (let t = 1; t < BoardManager.timeline.actions.length; t++) {
            const elem = AnimationToolBar.getActionElement(t);
            if (t <= currentIndex)
                elem.classList.add("actionExecuted");
            else
                elem.classList.remove("actionExecuted");
        }
    }


    static get animationActionList(): HTMLDivElement {
        return <HTMLDivElement>document.getElementById("animationActionList");
    }


    /**
     * @description updates the whole timeline
     */
    static update(): void {
        AnimationToolBar.currentIndex = BoardManager.timeline.getCurrentIndex();

        if (!AnimationToolBar.is())
            return;

        AnimationToolBar.actionElements = [];
        this.animationActionList.innerHTML = "";

        const elementForActionStart = AnimationToolBar.createActionElement(0)
        this.animationActionList.append(elementForActionStart);
        AnimationToolBar.actionElements[0] = elementForActionStart;


        let slide = AnimationToolBar.createSlideDiv();
        this.animationActionList.append(slide);

        for (let i = 1; i < BoardManager.timeline.actions.length; i++) {
            const actionElement = AnimationToolBar.createActionElement(i);
            AnimationToolBar.actionElements[i] = actionElement;
            slide.append(actionElement);

            if (BoardManager.timeline.actions[i].pause) {
                slide = AnimationToolBar.createSlideDiv();
                this.animationActionList.append(slide);
            }
        }

        document.getElementById("canvas").ondrop = () => {
            if (AnimationToolBar.dragAndDropFrames) {
                if (AnimationToolBar.selectedActionIndices.length != 0) {
                    AnimationToolBar.selectedActionIndices.sort((x, y) => x - y);
                    if (AnimationToolBar.selectedActionIndices[0] == 0)
                        AnimationToolBar.selectedActionIndices.splice(0, 1);
                    BoardManager.executeOperation(new OperationDeleteSeveralActions(AnimationToolBar.selectedActionIndices));
                    AnimationToolBar.selectedActionIndices = [];
                    AnimationToolBar.shiftSelectIndex = -1;
                }
                else if (AnimationToolBar.tSelected != 0) {
                    BoardManager.executeOperation(new OperationDeleteAction(AnimationToolBar.tSelected));
                    AnimationToolBar.selectedActionIndices.push(AnimationToolBar.tSelected);
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
    static createActionElement(t: number): HTMLElement {
        const action = BoardManager.timeline.actions[t];
        const el = document.createElement("div");

        el.dataset.index = t.toString();

        el.classList.add("action");
        el.style.backgroundImage = action.getOverviewImage();


        if (t == 0)
            el.classList.add("actionStart");

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
            const menu = new ActionTimeLineMenu(t);
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
                if (!AnimationToolBar.isActionSelected(+el.dataset.index))
                    AnimationToolBar.deselect();
                AnimationToolBar.currentIndex = +el.dataset.index;
                BoardManager.timeline.setCurrentIndex(+el.dataset.index);
                AnimationToolBar.updateCurrentIndex();
            }
        }


        el.onmousemove = () => {
            BoardManager.timeline.setCurrentIndex(+el.dataset.index);
        }


        el.onmouseleave = () => {
            BoardManager.timeline.setCurrentIndex(AnimationToolBar.currentIndex);
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

        el.ondblclick = () => { BoardManager.executeOperation(new OperationPauseAction(t)); }

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
    static isActionSelected(t: number): boolean { return AnimationToolBar.selectedActionIndices.indexOf(t) >= 0; }


    /**
     * 
     * @returns true iff there is a selection
     */
    static isSelection(): boolean { return AnimationToolBar.selectedActionIndices.length > 0; }
}
