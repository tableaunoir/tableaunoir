import { AnimationToolBar } from './AnimationToolBar';
import { Drawing } from './Drawing';
import { CircularMenu } from './CircularMenu';
import { MagnetTextManager } from './MagnetTextManager';
import { Wallpaper } from './Wallpaper';
import { ShowMessage } from './ShowMessage';
import { GUIActions } from './GUIActions';
import { Sound } from './Sound';
import { TestPerformance } from './TestPerformance';
import { CSSStyleModifier } from './CSSStyleModifier';
import { BoardNavigation } from './BoardNavigation';
import { Share } from "./share";
import { MyMagnets } from "./myMagnets";
import { MagnetManager } from './magnetManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { LoadSave } from './LoadSave';
import { Layout } from './Layout';
import { Toolbar } from './Toolbar';
import { Discussion } from './Discussion';
import { ChalkCursor } from './ChalkCursor';
import { BackgroundTexture } from './BackgroundTexture';
import { BackgroundDocuments } from './BackgroundDocuments';
import { Translation } from './Translation';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { KeyBoardShortCuts } from './KeyBoardShortCuts';
import { S, Script } from './Script';
import { Export } from './Export';
import { Tool } from './Tool';
import { DesktopApplicationManager } from './DesktopApplicationManager';
import { Action } from './Action';
import { ToolDrawOptions } from './ToolDrawOptions';

TestPerformance.init();

window.onload = load;
window['Menu'] = Menu; //for Menu to be used in index.html




//let loaded = false;

/**
 * this function sets the document.body scrolls to 0
 * It solves some issues:
 * - on smartphones: that we can scroll the page itself
 * - when typing texts in magnet, it makes the screen not to scroll
 */
function installBodyNoScroll() {
	setInterval(() => {
		document.body.scrollLeft = 0;
		document.body.scrollTop = 0;
	}, 1000);
}


function load() {
	try {
		installBodyNoScroll();

		UserManager.init();
		ToolDrawOptions.init();

		BackgroundDocuments.init();
		Layout.init();

		Translation.init();
		ChalkCursor.init();
		LoadSave.init();
		Export.init();
		BoardManager.init();
		Menu.init();
		Share.init();
		Toolbar.init();
		Discussion.init();
		CSSStyleModifier.init();
		Drawing.init();
		BoardNavigation.init();
		BackgroundTexture.init();
		GUIActions.init();
		MagnetManager.init();
		MyMagnets.loadMagnets();
		Sound.init();
		Script.init();
		Wallpaper.init();
		Tool.init();
		Drawing.init();
		Action.init();
		BoardManager.reset();
		DesktopApplicationManager.init();

		AnimationToolBar.init();

		Array.from(document.getElementsByTagName("helpbutton")).map((b) => (<HTMLElement>b).onclick = (evt) => { alert((<HTMLElement>evt.target).title) });

		document.getElementById("buttonMenu").onclick = Menu.toggle;
		document.getElementById("buttonColors").onclick = (evt) => {
			GUIActions.changeColor();
			evt.stopPropagation();
		}

		document.getElementById("buttonChalk").onclick = GUIActions.switchDrawEraser;
		document.getElementById("buttonEraser").onclick = GUIActions.switchDrawEraser;

		document.getElementById("buttonTools").onclick = (evt) => {
			GUIActions.toolmenu.show({ x: UserManager.me.x, y: UserManager.me.y });
			evt.stopPropagation();
		}

		document.getElementById("buttonText").onclick = () => MagnetTextManager.addMagnetText(UserManager.me.x, UserManager.me.y);
		document.getElementById("buttonDivide").onclick = () => Share.execute("divideScreen", [UserManager.me.userID, Layout.getXMiddle()]);

		document.getElementById("buttonLeft").onclick = BoardNavigation.leftPreviousPage;

		document.getElementById("buttonRight").onclick = BoardNavigation.rightNextPage;
		document.getElementById("buttonMap").onclick = () => Layout.toggleMinimap();

		document.getElementById("buttonCancel").onclick = () => BoardManager.cancel(UserManager.me.userID);//Share.execute("cancel", [UserManager.me.userID]);
		document.getElementById("buttonRedo").onclick = () => BoardManager.redo(UserManager.me.userID);//Share.execute("redo", [UserManager.me.userID]);

		document.getElementById("buttonAskQuestion").onclick = Discussion.askQuestion;

		document.onkeydown = KeyBoardShortCuts.onKeyDown;
		document.onkeyup = KeyBoardShortCuts.onKeyUp;

		document.getElementById("canvasBackground").onpointermove = () => { console.log("mousemove on the background should not occur") };


		window.addEventListener("click", () => { AnimationToolBar.hideMenu(); MagnetManager.hideMenu() });

		installMouseEventsCanvas();

		const params = (new URL(document.location.href)).searchParams;
		if (params.get("load") != null && params.get("id") == null) {
			LoadSave.loadTableaunoirFileFromURL(params.get("load"));
		}

	}
	catch (e) {
		console.error(e.stack);
		ShowMessage.error("Problem in loading Tableaunoir... please try to clean the cache of your browser.");
	}

}

function installMouseEventsCanvas() {
	/**
	 * This is the duration between two mousemove without drawing. It means that two too close mousemove (less that minDurationMouseMove)
	 * will not be sent to the other users to save bandwidth
	 */
	const minDurationMouseMove = 100;

	/**
	 * A flag to say that the next mousemove event will be shared among the other users
	 */
	let timeToSendMouseMoveEvent = true;

	/**
	 * A flag saying that mousedown has occured. So the next mousemove will be sent anyway
	 */
	let isCurrentlyMouseDown = false;

	/**
	 * says whether Tableaunoir has the focus or not
	 * If hasTableaunoirFocus == false, then Tableaunoir has *not* the focus and a click should just switch to Tableaunoir's window
	 * with drawing a point or something
	 */
	let hasTableaunoirFocus = true;

	/**
	 * A flag to say that the mousedown event was with right button and thus we switched temporarily to Erasing Tool
	 */
	let isToolTemporarilySwitchedToErase = false;

	setInterval(() => {
		timeToSendMouseMoveEvent = true;
		hasTableaunoirFocus = document.hasFocus()
	}, minDurationMouseMove);

	document.getElementById("canvas").oncontextmenu = (evt) => { evt.preventDefault(); }

	document.getElementById("canvas").onpointerdown = (evt) => {
		evt.preventDefault();
		if (hasTableaunoirFocus) {
			const rightButton = (evt.button == 2);

			if (!isCurrentlyMouseDown) // issue #273. With tablet you can have nested pointeddown so do not chage chageToErase to false if it was true in an earlier pointerdown event
				isToolTemporarilySwitchedToErase = false;

			if (rightButton) {
				const magnetInBackground = GUIActions.getMagnetBackgroundUnderCursor(UserManager.me.x, UserManager.me.y);
				if (magnetInBackground) {
					//the +1 are here for evt.preventDefault() to work (not showing the ctx menu of the browser)
					MagnetManager.showMenu(evt.pageX + 1, evt.pageY + 1);
					isCurrentlyMouseDown = false;
					return;
				}
				else if (UserManager.me.isToolDraw) {
					isToolTemporarilySwitchedToErase = true;
					Share.execute("switchEraser", [UserManager.me.userID]);
				}
				else
					isToolTemporarilySwitchedToErase = false;
			}

			isCurrentlyMouseDown = true;
			window["ismousedown"] = true;
			Share.execute("mousedown", [UserManager.me.userID, evt])
		}
	};

	document.getElementById("canvas").onpointermove = (evt) => {
		evt.preventDefault();
		const point = { x: evt.offsetX, y: evt.offsetY };
		window["point"] = point;
		S.onmousemove(point);

		if ((isCurrentlyMouseDown && UserManager.me.canWrite) || timeToSendMouseMoveEvent) {
			Share.execute("mousemove", [UserManager.me.userID, evt]);
			timeToSendMouseMoveEvent = false; //prevent sending the very next mousemove event
		}


	};
	document.getElementById("canvas").onpointerup = (evt) => {
		evt.preventDefault();
		isCurrentlyMouseDown = false;
		window["ismousedown"] = false;
		Share.execute("mouseup", [UserManager.me.userID, evt])
		if (isToolTemporarilySwitchedToErase) // switch back to draw if erase was temporary
			Share.execute("switchDraw", [UserManager.me.userID]);
	};

	//onpointerleave: stop the drawing to prevent bugs (like it draws a small line)
	document.getElementById("canvas").onpointerleave = (evt) => {
		evt.preventDefault();
		isCurrentlyMouseDown = false;
		window["ismousedown"] = false;
		Share.execute("mouseup", [UserManager.me.userID, evt]);

		if (isToolTemporarilySwitchedToErase) // switch back to draw if erase was temporary
			Share.execute("switchDraw", [UserManager.me.userID]);
	};

	TouchScreen.addTouchEvents(document.getElementById("canvas"));

	document.getElementById("controls").onclick = CircularMenu.hide;
	document.getElementById("animationToolBar").onclick = CircularMenu.hide;
}

export function getCanvas(): HTMLCanvasElement {
	return <HTMLCanvasElement>document.getElementById("canvas");
}


export function getCanvasBackground(): HTMLCanvasElement {
	return <HTMLCanvasElement>document.getElementById("canvasBackground");
}



export function getContainer(): HTMLElement {
	return document.getElementById("container");
}


