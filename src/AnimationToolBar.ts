import { Layout } from './Layout';
import { ActionTimeLineMenu } from './ActionTimeLineMenu';
import { OperationDeleteAction } from './OperationDeleteAction';
import { OperationMoveAction } from './OperationMoveAction';
import { OperationMoveSevActions } from './OperationMoveSeveralActions';
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
    static foldIndexes:number[] = [];
    static actionsToBeMoved: number[] = [];
    static lastSelectedIndex = -1;


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
     * @param the index of the action in the history
     *
     * @returns a pair of indexes, the first one refers to the direct children of animationToolBar the action is in, the
     * second one refers to the index of the folded div the action is in (-1 if not in one).
     * Will return (-1, -1) in case of failure.
     */
    static WhereAmI (n: number) : [number, number] {
        let currIndex = -1;

        for(let i = 1; i < document.getElementById("animationActionList").children.length; i++) {
            if(document.getElementById("animationActionList").children[i].classList.contains("foldedDiv")) {
                for(let j = 0; j < document.getElementById("animationActionList").children[i].children.length; j++) {
                    currIndex ++;
                    if(currIndex == n)
                        return [i, j];
                }
            }
            else if(document.getElementById("animationActionList").children[i].classList.contains("actionPause")) {
                currIndex ++;
                if(currIndex == n)
                    return [i, -1];
            }
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
        const index = AnimationToolBar.foldIndexes.indexOf(n);
        if(index == -1)
            el.style.backgroundImage = "url(\"img/open.png\")";
        else
            el.style.backgroundImage = "url(\"img/close.png\")";
        el.onclick = () =>
        {
            if(index == -1)
                AnimationToolBar.foldIndexes.push(n);
			else
				AnimationToolBar.foldIndexes.splice(index, 1);
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
        if(AnimationToolBar.foldIndexes.indexOf(n) != -1)
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

        document.getElementById("animationActionList").append(AnimationToolBar.HTMLElementForAction(0));

        for (let i = 1; i < BoardManager.timeline.actions.length; i++) {
            if (BoardManager.timeline.actions[i].pause) {

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
                BoardManager.executeOperation(new OperationDeleteAction(AnimationToolBar.tSelected));
                
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
        const action = BoardManager.timeline.actions[t];
        const el = document.createElement("div");

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
            AnimationToolBar.tSelected = t;
            AnimationToolBar.dragAndDropFrames = true;
        }

        document.addEventListener("keydown", function(event)
        {
            if(event.key == "Escape")
            {
                for(let k = 0; k < AnimationToolBar.actionsToBeMoved.length; k++)
                {
                    let pos = AnimationToolBar.WhereAmI(k);
                    if(pos[1] == -1)
                        document.getElementById("animationActionList").children[pos[0]].classList.remove("green");
                    else
                        document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.remove("green");
                }
                AnimationToolBar.lastSelectedIndex = -1;
                AnimationToolBar.actionsToBeMoved = [];
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
            const selectMode  = (event.ctrlKey);
            const selectModeShift  = (event.shiftKey);

            if(selectMode)
            {
                const index = AnimationToolBar.actionsToBeMoved.indexOf(t);
                if(el.classList.contains("green"))
                {
                    AnimationToolBar.actionsToBeMoved.splice(index, 1);
                    el.classList.remove("green");
	                if(action.pause)
	                {
	                    const pauseIndex = AnimationToolBar.WhereAmI(t);
	                    const elsToRemove = document.getElementById("animationActionList").children[pauseIndex[0] - 1].children;
	                    for(let k = 0; k < elsToRemove.length; k ++)
	                    {
	                        elsToRemove[k].classList.remove("green");
	                    }
                        AnimationToolBar.actionsToBeMoved.splice(index, elsToRemove.length);
	                }
                }
                else
                {
                    AnimationToolBar.actionsToBeMoved.push(t);
                    el.classList.add("green");
	                if(action.pause)
	                {
	                    const pauseIndex = AnimationToolBar.WhereAmI(t);
	                    const elsToAdd = document.getElementById("animationActionList").children[pauseIndex[0] - 1].children;
	                    for(let k = 0; k < elsToAdd.length; k ++)
	                    {
	                        elsToAdd[k].classList.add("green");
                            AnimationToolBar.actionsToBeMoved.push(t-(k+1));
	                    }
	                }
                }
            }
            else if(selectModeShift)
            {
                if(AnimationToolBar.lastSelectedIndex == -1)
                {
					AnimationToolBar.lastSelectedIndex = t;
                    AnimationToolBar.actionsToBeMoved.push(t);
                    el.classList.add("green");
                }
                else if(AnimationToolBar.lastSelectedIndex != -1)
                {
                    if(t == AnimationToolBar.lastSelectedIndex)
                    {
                        const index = AnimationToolBar.actionsToBeMoved.indexOf(t);
		                AnimationToolBar.actionsToBeMoved.splice(index, 1);
		                el.classList.remove("green");
                    }
                    else if(t < AnimationToolBar.lastSelectedIndex)
                    {
                        AnimationToolBar.actionsToBeMoved.push(t);
                        el.classList.add("green");
                        for(let k = t + 1; k < AnimationToolBar.lastSelectedIndex; k++)
                        {
                            AnimationToolBar.actionsToBeMoved.push(k);
                            let pos = AnimationToolBar.WhereAmI(k);
	                        if(pos[1] == -1 && pos[0] != -1)
	                            document.getElementById("animationActionList").children[pos[0]].classList.add("green");
	                        else if(pos[0] != -1)
	                            document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.add("green");
                        }
                    }
                    else
                    {
                        AnimationToolBar.actionsToBeMoved.push(t);
                        el.classList.add("green");
                        for(let k = AnimationToolBar.lastSelectedIndex + 1; k < t; k++)
                        {
                            AnimationToolBar.actionsToBeMoved.push(k);
                            let pos = AnimationToolBar.WhereAmI(k);
                            if(pos[1] == -1 && pos[0] != -1)
                                document.getElementById("animationActionList").children[pos[0]].classList.add("green");
                            else if(pos[0] != -1)
                                document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.add("green");
                        }
                    }
                }
            }
            else
            {
                BoardManager.timeline.setCurrentIndex(t);
                for (let i = 1; i < BoardManager.timeline.actions.length; i++)
                {
                    let pos = AnimationToolBar.WhereAmI(i);
                    if (i < t)
                    {
                        if(pos[1] == -1 && pos[0] != -1)
                            document.getElementById("animationActionList").children[pos[0]].classList.add("actionExecuted");
                        else if(pos[0] != -1)
                            document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.add("actionExecuted");
                    }
                    else
                    {
                        if(pos[1] == -1 && pos[0] != -1)
                            document.getElementById("animationActionList").children[pos[0]].classList.remove("actionExecuted");
                        else if (pos[0] != -1)
                            document.getElementById("animationActionList").children[pos[0]].children[pos[1]].classList.remove("actionExecuted");
                    }
                }
            }
        }

        el.ondrop = () => {
            if(AnimationToolBar.actionsToBeMoved.length == 0) {
                BoardManager.executeOperation(new OperationMoveAction(AnimationToolBar.tSelected, t));
            } else {
	            AnimationToolBar.actionsToBeMoved.sort((x, y) => x - y);
                BoardManager.executeOperation(new OperationMoveSevActions(AnimationToolBar.actionsToBeMoved, t));
            }
            AnimationToolBar.actionsToBeMoved = [];
            AnimationToolBar.lastSelectedIndex = -1;
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
