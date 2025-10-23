import { UserManager } from './UserManager';
import { Share } from './share';
import { SelectionActions } from './SelectionActions';
import { ActionSlideStart } from './ActionSlideStart';
import { BoardManager } from './boardManager';
import { Action } from './Action';
import { ActionFreeDraw } from './ActionFreeDraw';
import { MagnetHighlighter } from './MagnetHighlighter';
import { ActionMagnetNew } from './ActionMagnetNew';
import { ActionMagnetMove } from './ActionMagnetMove';
import { ActionClear } from './ActionClear';
import { ChalkParticules } from './ChalkParticules';
import { ActionErase } from './ActionErase';
import { ActionRectangle } from './ActionRectangle';
import { ActionEllipse } from './ActionEllipse';
import { ActionLine } from './ActionLine';
import { ShowMessage } from './ShowMessage';
import { ActionMagnetDelete } from './ActionMagnetDelete';


/**
 * this class handles the toolbar at the bottom for the animation
 */
export class AnimationToolBar {
    static init() {
        document.getElementById("previousSlide").onclick = () => Share.execute("timelinePreviousPausedFrame", []);
        document.getElementById("nextSlide").onclick = () => Share.execute("timelineNextPausedFrame", []);
        document.getElementById("buttonNewSlideAndClear").onclick = () => Share.execute("newSlideAndClear", [UserManager.me.userID]);

        document.getElementById("timelineMenu").onclick = (evt) => {
            AnimationToolBar.showMenu(evt.pageX, evt.pageY);
            evt.stopPropagation();//prevent the menu to be hidden because of a click on the toolbar
        }

        // these button are hidden in the GUI
        document.getElementById("previousFrame").onclick = () => Share.execute("timelinePreviousFrame", []);
        document.getElementById("nextFrame").onclick = () => Share.execute("timelineNextFrame", []);

    }

    static currentIndex = 0;

    static selection: SelectionActions = new SelectionActions();

    static deselect(): void {
        if (AnimationToolBar.selection.isEmpty)
            return;
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


    /**
    @param slideNumber (1, 2, 3)...
    @param from (either ActionInit, or ActionPause)   
    @returns a new slide that will contain all actions of the slide
     */
    static createSlideDiv(slideNumber: number, from: number, to: number): HTMLElement {
        const slide = document.createElement("div");
        slide.dataset.from = from + "";
        slide.dataset.to = to + "";
        slide.classList.add("slide");

        if (from + 1 <= to)
            if (BoardManager.timeline.actions[from + 1] instanceof ActionClear)
                slide.classList.add("slideClear");

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
            /*  if (isCurrentSlide) {
                  const x = evt.clientX - slide.offsetLeft;
                  return from + Math.round(x * (to - from) / slide.clientWidth);
              }
              else*/
            return to;
        }

        slide.onclick = (evt) => {
            const t = actionIndex(evt); // /!\ compute first (to be sure it is not updated because if the DOM is changed you may get wrong values)

            if (evt.ctrlKey)
                AnimationToolBar.selection.addInterval(from, to);
            else if (evt.shiftKey) {
                AnimationToolBar.selection.contiguousAdd(from);
                AnimationToolBar.selection.contiguousAdd(to);
            }
            else if (!AnimationToolBar.selection.includesInterval(from, to))
                AnimationToolBar.deselect();

            Share.execute("timelineSetCurrentIndex", [t]);

        }



        slide.onmousemove = (evt) => {
            SnapshotGoToTimeStep.goto(actionIndex(evt));
        }

        slide.onmouseleave = () => {
            SnapshotGoToTimeStep.goto(AnimationToolBar.currentIndex);
        }


        slide.oncontextmenu = (evt) => {
            const t = actionIndex(evt);
            Share.execute("timelineSetCurrentIndex", [t]);
            AnimationToolBar.showMenu(evt.pageX, evt.pageY);
            evt.preventDefault();
            return;
        }


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

        /**
         * 
         * @param a1 
         * @param a2 
         * @returns true if actions a1 and a2 are far, different
         * @description this function is used to add spacing between "different" actions
         */
        function areActionsActionFreeDrawQuiteDifferent(a1: Action, a2: Action): boolean {
            if (!(a1 instanceof ActionFreeDraw) || !(a2 instanceof ActionFreeDraw))
                return false;

            function isOverlap(
                Ax1, Ay1, Ax2, Ay2,
                Bx1, By1, Bx2, By2): boolean {
                if (Ax1 > Bx2 || Bx1 > Ax2)
                    return false;

                if (By1 > Ay2 || Ay1 > By2)
                    return false;

                return true;
            }

            const R1 = a1.rect;
            const R2 = a2.rect;

            const TT = 50;

            return !isOverlap(
                R1.x1 - TT, R1.y1 - TT, R1.x2 + TT, R1.y2 + TT,
                R2.x1 - TT, R2.y1 - TT, R2.x2 + TT, R2.y2 + TT);
        }

        const elAction = document.createElement("div");

        elAction.dataset.index = t.toString();

        elAction.classList.add("action");

        if (t > 0) {
            const previousAction = BoardManager.timeline.actions[t - 1];
            if (areActionsActionFreeDrawQuiteDifferent(action, previousAction)) {
                elAction.classList.add("actionDifferent");
            }
        }

        elAction.style.backgroundImage = action.getOverviewImage();

        if (!action.isBlocking) elAction.classList.add("actionParallel");
        if (t <= BoardManager.timeline.getCurrentIndex()) elAction.classList.add("actionExecuted");

        elAction.draggable = true;

        elAction.oncontextmenu = (evt) => {
            Share.execute("timelineSetCurrentIndex", [t]);
            AnimationToolBar.showMenu(evt.pageX, evt.pageY);
            evt.preventDefault();
            return;
        }

        elAction.ondragend = () => { /* nothing */ };

        elAction.onclick = (event) => {
            if (event.ctrlKey)
                AnimationToolBar.selection.add(t);
            else if (event.shiftKey)
                AnimationToolBar.selection.contiguousAdd(t);
            else if (!AnimationToolBar.selection.has(t))
                AnimationToolBar.deselect();

            Share.execute("timelineSetCurrentIndex", [t]);
        }

        elAction.ondrag = (evt) => {
            if (AnimationToolBar.selection.isEmpty || evt.ctrlKey) {
                AnimationToolBar.selection.add(t);
                elAction.classList.add("selected");
            }


            //AnimationToolBar.update();
        }

        elAction.onmousemove = () => {
            BoardManager.timeline.setCurrentIndex(t);
        }

        /**
         * show some hints for the selected action action
         */
        function highlightAction() {
            /**
             * 
             * @param magnetid 
             * @param t 
             * @returns true if there is a magnet of id magnetid on the screen at time t
             */
            function isThereAMagnetWithID(magnetid: string, t: number): boolean {
                for (let t2 = t - 1; t2 >= 0; t2--) {
                    const act = BoardManager.timeline.actions[t2];
                    if(act instanceof ActionClear) {
                        return false
                    }
                    else if (act instanceof ActionMagnetDelete) {
                        if (act.magnetid == magnetid)
                            return false;
                    }
                    else if (act instanceof ActionMagnetNew) {
                        if (act.magnetid == magnetid)
                            return true;
                    }
                }
                return false;
            }

            if (action instanceof ActionMagnetNew) {
                if (document.getElementById(action.magnetid))
                    MagnetHighlighter.highlight(document.getElementById(action.magnetid));
            }
            else if (action instanceof ActionMagnetMove) {
                if (document.getElementById(action.magnetid))
                    MagnetHighlighter.highlight(document.getElementById(action.magnetid));
                else {
                    if (!isThereAMagnetWithID(action.magnetid, t))
                        ShowMessage.error(`<img class="icon" src="img/icons/E0AB.svg"/> Temporal paradox: this action is supposed to move a magnet which does not exist yet. Solution: you may correct the timeline by creating a magnet before its move nearby the start point, and Tableaunoir will try to move it in order to face the temporal paradox.`);
                }

                ActionMagnetMoveHighlighter.highlight(action);
            }
            else if (action instanceof ActionFreeDraw ||
                action instanceof ActionEllipse ||
                action instanceof ActionLine ||
                action instanceof ActionRectangle)
                ActionFromContourHighlighter.highlight(action.contour);
            else if (action instanceof ActionErase)
                ActionEraseHighlighter.highlight(action);

        }

        /**
         * remove all the highlighting hints for actions
         */
        function unhighlightAction() {
            MagnetHighlighter.unhighlightAll();
            ActionMagnetMoveHighlighter.unhighlight();
            ActionFromContourHighlighter.unhighlight();
            ActionEraseHighlighter.unhighlight();
        }


        elAction.onmouseenter = highlightAction;
        elAction.onmouseleave = () => { BoardManager.timeline.setCurrentIndex(AnimationToolBar.currentIndex); unhighlightAction(); }

        elAction.ondragover = () => { console.log("dragover"); elAction.classList.add("dragover"); }
        elAction.ondragleave = () => { elAction.classList.remove("dragover"); }

        elAction.ondrop = () => {
            AnimationToolBar.selection.moveTo(t);
            AnimationToolBar.update();
        }

        if (action instanceof ActionSlideStart && t > 0)
            elAction.title = "Beginning of the slide. Remove me (drag me out the list) in order to merge with the previous slide";
        else if (action instanceof ActionClear)
            elAction.title = "Action 'clear all the board'. Remove me (drag me out the list) so that the board is not cleared!";

        return elAction;
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


    static hideMenu(): void { document.getElementById("contextMenuTimeLine").style.display = "none" }
    static isMenu(): boolean { return document.getElementById("contextMenuTimeLine").style.display == "block"; }

    /**
     * @description show the menu with the command newslide, newlideandclear, mergeslide etc.
     */
    static showMenu(x: number, y: number): void {
        /*if (AnimationToolBar.menu == undefined)
            AnimationToolBar.menu = new ActionTimeLineMenu();
        AnimationToolBar.menu.show({ x: Layout.getXMiddle(), y: 800 });*/

        const menu = document.getElementById("contextMenuTimeLine")
        menu.style.display = 'block';


        if (y + menu.clientHeight > window.innerHeight)
            y = window.innerHeight - menu.clientHeight;

        menu.style.left = x + "px";
        menu.style.top = y + "px";

        document.getElementById("mergeSlide").onclick = () => {
            Share.execute("mergeSlide", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
        }

        function newSlideAndClear() {
            console.log("newslideandclear")
            Share.execute("newSlideAndClear", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
        }
        document.getElementById("newSlideAndClear").onclick = newSlideAndClear;

        document.getElementById("newSlide").onclick = () => {
            Share.execute("newSlide", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
        };

        document.getElementById("addActionWait").onclick = () => {
            Share.execute("addActionWait", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
        };



        document.getElementById("forgetAnimation").onclick = () => {
            Share.execute("forgetAnimation", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
        };
    }
}









class SnapshotGoToTimeStep {
    private static t = 0;
    static timeoutSnapshot = null;

    private static _update() {
        BoardManager.timeline.setCurrentIndex(SnapshotGoToTimeStep.t);
        SnapshotGoToTimeStep.timeoutSnapshot = null;
    }

    static goto(t: number) {
        SnapshotGoToTimeStep.t = t;
        if (SnapshotGoToTimeStep.timeoutSnapshot == null)
            SnapshotGoToTimeStep.timeoutSnapshot = setTimeout(SnapshotGoToTimeStep._update, 200);
    }
}






class ActionEraseHighlighter {
    static timer = undefined;

    static highlight(action: ActionErase) {
        this.unhighlight();

        this.timer = setInterval(() => {
            for (let t = 0; t < 20; t++) {
                const i = Math.floor((action.points.length) * Math.random());
                const p = action.points[i];
                const radius = Math.random() * p.lineWidth;
                const angle = 2 * Math.PI * Math.random();
                const r = Math.floor(255 * Math.random());
                const g = Math.floor(255 * Math.random());
                const b = Math.floor(255 * Math.random());
                ChalkParticules.start(p.x + radius * Math.sin(angle), p.y + radius * Math.sin(angle), 0,
                    `rgb(${r}, ${g}, ${b})`, 1);
            }
        }, 100);
    }

    static unhighlight() {
        if (this.timer)
            clearInterval(this.timer);
    }
}

class ActionFromContourHighlighter {
    static timer = undefined;
    static i = 0;

    static highlight(contourPoints: any[]) {
        this.unhighlight();

        this.timer = setInterval(() => {
            this.i = this.i > contourPoints.length - 2 ? 0 : this.i + 1;
            const p = contourPoints[this.i];
            ChalkParticules.start(p.x, p.y, p.pressure ? p.pressure : 1, p.color ? p.color : "gray");
        }, 100);
    }

    static unhighlight() {
        this.i = 0;
        if (this.timer)
            clearInterval(this.timer);
    }
}



class ActionMagnetMoveHighlighter {
    private static addSVGPolyLine(points: { x: number, y: number }[]): SVGPolylineElement {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGPolylineElement>document.createElementNS(svgns, 'polyline');
        shape.setAttributeNS(null, 'points', points.map(({ x, y }) => x + "," + y).join(" "));
        document.getElementById("svg").appendChild(shape);
        shape.classList.add("magnetMovePolyLine")
        return shape;
    }


    static highlight(action: ActionMagnetMove) {
        ActionMagnetMoveHighlighter.addSVGPolyLine(action.pointsCentered);
    }


    static unhighlight() { document.querySelectorAll(".magnetMovePolyLine").forEach((el) => el.remove()); }
}