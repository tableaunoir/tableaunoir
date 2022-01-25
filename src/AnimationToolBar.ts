import { Share } from './share';
import { SelectionActions } from './SelectionActions';
import { ActionSlideStart } from './ActionSlideStart';
import { Layout } from './Layout';
import { ActionTimeLineMenu } from './ActionTimeLineMenu';
import { BoardManager } from './boardManager';


/**
 * this class handles the toolbar at the bottom for the animation
 */
export class AnimationToolBar {

    static currentIndex = 0;

    static isActionSelected(): boolean { return false }
    static selection: SelectionActions = new SelectionActions();

    static deselect(): void {
        AnimationToolBar.selection = new SelectionActions();
        AnimationToolBar.update();
    }
    static isSelection(): boolean { return !AnimationToolBar.selection.isEmpty; }

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
    @param slideNumber (1, 2, 3)...
    @param from (either ActionInit, or ActionPause)   
     * @returns a new slide that will contain all actions of the slide
     */
    static createSlideDiv(slideNumber: number, from: number, to: number): HTMLElement {
        const slide = document.createElement("div");
        slide.dataset.from = from + "";
        slide.dataset.to = to + "";
        slide.classList.add("slide");
        slide.title = "slide n°" + slideNumber;
        slide.style.flexGrow = "" + Math.max(1, to - from);

        const i = AnimationToolBar.currentIndex;
        const isCurrentSlide = (from <= i) && (i <= to);
        if (from <= i) {
            if (i >= to)
                slide.style.background = "red";
            else {
                const ratio = (to - from) == 0 ? 100 : 100 * (i - from) / (to - from);
                slide.style.background = `linear-gradient(to right, red ${ratio}%, gray ${ratio}%)`;
            }
        }


        if (AnimationToolBar.selection.includesInterval(from, to))
            slide.classList.add("selected");

        if (isCurrentSlide)
            slide.classList.add("slideCurrent");

        const actionIndex = (evt) => {
            if (isCurrentSlide) {
                const x = evt.clientX - slide.offsetLeft;
                return from + Math.round(x * (to - from) / slide.clientWidth);
            }
            else
                return to;
        }

        slide.onclick = (evt) => {
            const j = actionIndex(evt); // /!\ compute first (to be sure it is not updated because if the DOM is changed you may get wrong values)

            if (evt.ctrlKey)
                AnimationToolBar.selection.addInterval(from, to);
            else if (evt.shiftKey) {
                AnimationToolBar.selection.contiguousAdd(from);
                AnimationToolBar.selection.contiguousAdd(to);
            }
            else if (!AnimationToolBar.selection.includesInterval(from, to))
                AnimationToolBar.deselect();



            Share.execute("timelineSetCurrentIndex", [j]);

        }
        slide.onmousemove = (evt) => {
            const j = actionIndex(evt);
            BoardManager.timeline.setCurrentIndex(j);
        }


        slide.onmouseleave = () => { BoardManager.timeline.setCurrentIndex(AnimationToolBar.currentIndex); }

        slide.draggable = true;

        slide.ondrag = (evt) => {
            if (AnimationToolBar.selection.isEmpty || evt.ctrlKey) {
                AnimationToolBar.selection.addInterval(from, to);
                slide.classList.add("selected"); // /!\ we should not call update because the DOM elements should be the same otherwise the drag & drop does not work
            }
        }

        slide.ondragover = () => { slide.classList.add("dragover"); }
        slide.ondragleave = () => { slide.classList.remove("dragover"); }

        slide.ondrop = () => {
            AnimationToolBar.selection.moveTo(to);
            AnimationToolBar.update();
        }
        return slide;
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

        if (!action.isBlocking) el.classList.add("actionParallel");
        if (t <= BoardManager.timeline.getCurrentIndex()) el.classList.add("actionExecuted");

        el.draggable = true;

        el.oncontextmenu = (evt) => {
            AnimationToolBar.showMenu();
            evt.preventDefault();
            return;
        }

        el.ondragend = () => { /* nothing */ };

        el.onclick = (event) => {
            if (event.ctrlKey)
                AnimationToolBar.selection.add(t);
            else if (event.shiftKey)
                AnimationToolBar.selection.contiguousAdd(t);
            else if (!AnimationToolBar.selection.has(t))
                AnimationToolBar.deselect();

            Share.execute("timelineSetCurrentIndex", [t]);
        }

        el.ondrag = (evt) => {
            if (AnimationToolBar.selection.isEmpty || evt.ctrlKey) {
                AnimationToolBar.selection.add(t);
                el.classList.add("selected");
            }


            //AnimationToolBar.update();
        }

        el.onmousemove = () => { BoardManager.timeline.setCurrentIndex(t); }
        el.onmouseleave = () => { BoardManager.timeline.setCurrentIndex(AnimationToolBar.currentIndex); }

        el.ondragover = () => { console.log("dragover"); el.classList.add("dragover"); }
        el.ondragleave = () => { el.classList.remove("dragover"); }

        el.ondrop = () => {
            AnimationToolBar.selection.moveTo(t);
            AnimationToolBar.update();
        }

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

        AnimationToolBar.requestUpdate();

    }

    /**
     * 
     * @param index 
     * @description update the timeline bar given that there was only the insertion of action at index that have been produced
     */
    static updateAddAction(index: number): void {
        if (!AnimationToolBar.is())
            return;

        AnimationToolBar.requestUpdate();
    }




    /**
     * @description update the fact that the current index has changed
     */
    static updateCurrentIndex(): void {
        AnimationToolBar.requestUpdate();
    }

    static request = undefined;

    static requestUpdate(): void {
        if (AnimationToolBar.request == undefined)
            AnimationToolBar.request = setTimeout(AnimationToolBar.update, 5);
    }

    static get timelineSlideList(): HTMLDivElement { return <HTMLDivElement>document.getElementById("timeline"); }
    static get slideActionList(): HTMLDivElement { return <HTMLDivElement>document.getElementById("timelineSlideActions"); }

    /**
     * @description updates the whole timeline
     */
    static update(): void {
        AnimationToolBar.request = undefined;

        if (!AnimationToolBar.is())
            return;

        AnimationToolBar.currentIndex = BoardManager.timeline.getCurrentIndex();

        AnimationToolBar.timelineSlideList.innerHTML = "";

        const loadSlideActionList = (from, to) => {
            AnimationToolBar.slideActionList.innerHTML = "";
            for (let i = from; i <= to; i++) {
                const actionElement = AnimationToolBar.createActionElement(i);
                if (AnimationToolBar.selection.has(i))
                    actionElement.classList.add("selected");
                AnimationToolBar.slideActionList.append(actionElement);
            }
        }

        let previousi = 0;
        let slideNumber = 1;
        for (let i = 0; i < BoardManager.timeline.actions.length; i++) {
            if (BoardManager.timeline.actions[i] instanceof ActionSlideStart && i > 0) {
                const slide = AnimationToolBar.createSlideDiv(slideNumber, previousi, i - 1);
                if (previousi <= AnimationToolBar.currentIndex && AnimationToolBar.currentIndex <= i - 1)
                    loadSlideActionList(previousi, i - 1);

                previousi = i;
                slideNumber++;
                AnimationToolBar.timelineSlideList.append(slide);

            }
            if (i == BoardManager.timeline.actions.length - 1) {
                const slide = AnimationToolBar.createSlideDiv(slideNumber, previousi, i);
                AnimationToolBar.timelineSlideList.append(slide);
                if (previousi <= AnimationToolBar.currentIndex && AnimationToolBar.currentIndex <= i)
                    loadSlideActionList(previousi, i);

                previousi = i;

                slideNumber++;
            }
        }

        //when things are dropped in the canvas then the selection is deleted
        document.getElementById("canvas").ondrop = () => { AnimationToolBar.selection.delete(); }


    }

    private static menu = undefined;

    /**
     * @description show the menu with the command newslide, newlideandclear, mergeslide etc.
     */
    static showMenu(): void {
        if (AnimationToolBar.menu == undefined)
            AnimationToolBar.menu = new ActionTimeLineMenu();
        AnimationToolBar.menu.show({ x: Layout.getXMiddle(), y: 800 });

    }

}
