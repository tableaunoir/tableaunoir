import { ActionPause } from './ActionPause';
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

    static currentIndex = 0;

    static isActionSelected(): boolean { return false }
    static selection: Set<number> = new Set();

    static deselect(): void { AnimationToolBar.selection.clear(); }
    static isSelection(): boolean { return AnimationToolBar.length > 0; }

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

        if (isCurrentSlide)
            slide.classList.add("slideCurrent");

        if (isCurrentSlide) {
            slide.onclick = (evt) => {
                console.log("onclick on currentslide")
                const x = evt.clientX - slide.offsetLeft;
                const j = from + Math.round(x * (to - from) / slide.clientWidth);
                BoardManager.timeline.setCurrentIndex(j)
                AnimationToolBar.currentIndex = j;
                AnimationToolBar.update();
            }
            slide.onmousemove = (evt) => {
                const x = evt.clientX - slide.offsetLeft;
                const j = from + Math.round(x * (to - from) / slide.clientWidth);
                BoardManager.timeline.setCurrentIndex(j);
                //BoardManager.timeline.setCurrentIndex(to);
            }
        }
        else {
            slide.onclick = (evt) => {
                const j = to;
                BoardManager.timeline.setCurrentIndex(j)
                AnimationToolBar.currentIndex = j;
                AnimationToolBar.update();


            }
            slide.onmousemove = (evt) => {
                const j = to;
                BoardManager.timeline.setCurrentIndex(j);
                //BoardManager.timeline.setCurrentIndex(to);
            }
        }

        slide.onmouseleave = () => { BoardManager.timeline.setCurrentIndex(AnimationToolBar.currentIndex); }



        slide.draggable = true;
        slide.ondrag = () => {
            AnimationToolBar.selection = new Set();
            for (let k = from; k <= to; k++)
                AnimationToolBar.selection.add(k);
            AnimationToolBar.update();
        }

        slide.ondragover = () => { slide.classList.add("dragover"); }
        slide.ondragleave = () => { slide.classList.remove("dragover"); }

        slide.ondrop = () => {
            const dest = to;
            console.log(AnimationToolBar.selection)
            console.log(Array.from(AnimationToolBar.selection))
            BoardManager.executeOperation(new OperationMoveSevActions(Array.from(AnimationToolBar.selection), dest));
            AnimationToolBar.selection.clear();
            AnimationToolBar.update();
        }
        return slide;
    }



    /**
     * 
     * @param t 
     * @returns update and take into account that the action n° t has been removed
     */
    static updateDeleteAction(t: number): void {
        if (!AnimationToolBar.is())
            return;

        AnimationToolBar.update();

    }

    /**
     * 
     * @param index 
     * @description update the timeline bar given that there was only the insertion of action at index that have been produced
     */
    static updateAddAction(index: number): void {
        if (!AnimationToolBar.is())
            return;

        AnimationToolBar.update();
    }




    /**
     * @description update the fact that the current index has changed
     */
    static updateCurrentIndex(): void {

        AnimationToolBar.update();
    }



    static get timelineSlideList(): HTMLDivElement { return <HTMLDivElement>document.getElementById("timeline"); }

    /**
     * @description updates the whole timeline
     */
    static update(): void {
        if (!AnimationToolBar.is())
            return;

        AnimationToolBar.currentIndex = BoardManager.timeline.getCurrentIndex();

        this.timelineSlideList.innerHTML = "";

        let previousi = 0;
        let j = 1;
        for (let i = 0; i < BoardManager.timeline.actions.length; i++) {
            if (BoardManager.timeline.actions[i] instanceof ActionPause) {
                const slide = AnimationToolBar.createSlideDiv(j, previousi, i - 1);
                previousi = i;
                j++;
                this.timelineSlideList.append(slide);
            }
            if (i == BoardManager.timeline.actions.length - 1) {
                const slide = AnimationToolBar.createSlideDiv(j, previousi, i);
                this.timelineSlideList.append(slide);
                previousi = i;
                j++;
            }
        }


    }


}

function range(start, end): number[] { return Array(end - start + 1).map((_, idx) => start + idx) }