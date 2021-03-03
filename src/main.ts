import { Wallpaper } from './Wallpaper';
import { ErrorMessage } from './ErrorMessage';
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
import { BlackVSWhiteBoard } from './BlackVSWhiteBoard';
import { Background } from './Background';
import { Translation } from './Translation';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { Drawing } from './Drawing';
import { KeyBoardShortCuts } from './KeyBoardShortCuts';
import { S, Script } from './Script';
import { Export } from './Export';

TestPerformance.init();

window.onload = load;
window['Menu'] = Menu; //for Menu to be used in index.html

window.onbeforeunload = function () {
	return "If you leave Tableaunoir, you will lose any unsaved changes."; //this will probably not be shown since modern browser do not care
}


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


		Background.init();
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
		BlackVSWhiteBoard.init();
		GUIActions.init();
		MagnetManager.init();
		MyMagnets.loadMagnets();
		Sound.init();
		Script.init();
		Wallpaper.init();

		BoardManager.load();


		document.getElementById("buttonMenu").onclick = Menu.toggle;
		document.getElementById("buttonColors").onclick = () => GUIActions.changeColor();

		document.getElementById("buttonChalk").onclick = GUIActions.switchChalkEraser;
		document.getElementById("buttonEraser").onclick = GUIActions.switchChalkEraser;

		document.getElementById("buttonTools").onclick = () => {
			GUIActions.toolmenu.show({ x: UserManager.me.x, y: UserManager.me.y });
		}

		document.getElementById("buttonText").onclick = () => MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
		document.getElementById("buttonDivide").onclick = () => Share.execute("divideScreen", [UserManager.me.userID, Layout.getXMiddle()]);

		document.getElementById("buttonLeft").onclick = BoardNavigation.leftPreviousPage;

		document.getElementById("buttonRight").onclick = BoardNavigation.rightNextPage;
		document.getElementById("buttonMap").onclick = () => {
			if (Layout.isMinimap)
				Layout.normal();
			else
				Layout.minimap();
		};
		document.getElementById("buttonCancel").onclick = () => Share.execute("cancel", [UserManager.me.userID]);
		document.getElementById("buttonRedo").onclick = () => Share.execute("redo", [UserManager.me.userID]);

		document.getElementById("buttonAskQuestion").onclick = Discussion.askQuestion;

		const buttons = document.getElementById("controls").children;

		for (let i = 0; i < buttons.length; i++)
			if (buttons[i] instanceof HTMLButtonElement)
				(<HTMLButtonElement>buttons[i]).onfocus = (<HTMLElement>document.activeElement).blur; //to be improved

		document.onkeydown = KeyBoardShortCuts.onKeyDown;
		document.onkeyup = KeyBoardShortCuts.onKeyUp;

		document.getElementById("canvasBackground").onpointermove = () => { console.log("mousemove on the background should not occur") };

		installMouseEventsCanvas();


	}
	catch (e) {
		ErrorMessage.show("Problem in loading Tableaunoir... please try to clean the cache of your browser.");
	}

}

function installMouseEventsCanvas() {
	const minDurationMouseMove = 100;//minimum duration between two mousemove without drawing
	let timeToMouseMove = true;
	let ismousedown = false;
	setInterval(() => { timeToMouseMove = true; }, minDurationMouseMove);

	//window["mv"]=0;
	//window["mvsent"]=0;

	document.getElementById("canvas").onpointerdown = (evt) => {
		evt.preventDefault();
		ismousedown = true;
		Share.execute("mousedown", [UserManager.me.userID, evt])
	};

	document.getElementById("canvas").onpointermove = (evt) => {
		evt.preventDefault();
		S.mousemove({ x: evt.offsetX, y: evt.offsetY });

		//	window["mv"]++;
		if ((ismousedown && UserManager.me.canWrite) || timeToMouseMove) {
			//		window["mvsent"]++;
			Share.execute("mousemove", [UserManager.me.userID, evt]);
			timeToMouseMove = false;
		}


	};
	document.getElementById("canvas").onpointerup = (evt) => {
		evt.preventDefault();
		ismousedown = false;
		Share.execute("mouseup", [UserManager.me.userID, evt])
	};

	//onpointerleave: stop the drawing to prevent bugs (like it draws a small line)
	document.getElementById("canvas").onpointerleave = (evt) => {
		evt.preventDefault();
		ismousedown = false;
		Share.execute("mouseup", [UserManager.me.userID, evt])
	};
	//document.getElementById("canvas").onmousedown = mousedown;

	TouchScreen.addTouchEvents(document.getElementById("canvas"));
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


