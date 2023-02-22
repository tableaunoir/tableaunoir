import { AnimationToolBar } from './AnimationToolBar';
import { Drawing } from './Drawing';
import { CircularMenu } from './CircularMenu';
import MagnetTextManager from './MagnetTextManager';
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

		/*
		   TODO: why?
			const buttons = document.getElementById("controls").children;
	
			for (let i = 0; i < buttons.length; i++)
				if (buttons[i] instanceof HTMLButtonElement)
					(<HTMLButtonElement>buttons[i]).onfocus = (<HTMLElement>document.activeElement).blur; //to be improved*/

		document.onkeydown = KeyBoardShortCuts.onKeyDown;
		document.onkeyup = KeyBoardShortCuts.onKeyUp;

		document.getElementById("canvasBackground").onpointermove = () => { console.log("mousemove on the background should not occur") };

		document.getElementById("previousSlide").onclick = () => Share.execute("timelinePreviousPausedFrame", []);
		document.getElementById("nextSlide").onclick = () => Share.execute("timelineNextPausedFrame", []);
		document.getElementById("timelineMenu").onclick = (evt) => {
			AnimationToolBar.showMenu(evt.pageX, evt.pageY);
			evt.stopPropagation();//prevent the menu to be hidden because of a click on the toolbar
		}

		// these button are hidden in the GUI
		document.getElementById("previousFrame").onclick = () => Share.execute("timelinePreviousFrame", []);
		document.getElementById("nextFrame").onclick = () => Share.execute("timelineNextFrame", []);

		window.addEventListener("click", () => AnimationToolBar.hideMenu());

		installMouseEventsCanvas();

		/*ErrorMessage.show("Tableaunoir works, but maybe not in share mode since INRIA servers are down see <a href='https://intranet.inria.fr/Actualite/Important-arret-complet-des-services-informatiques-locaux-le-mercredi-24-mars'>here</a>");*/


	}
	catch (e) {
		console.error(e.stack);
		ShowMessage.error("Problem in loading Tableaunoir... please try to clean the cache of your browser.");
	}

}

function installMouseEventsCanvas() {
	const minDurationMouseMove = 100;//minimum duration between two mousemove without drawing
	let timeToSendMouseMoveEvent = true; //if true, the mousemove event is shared among the other users
	let ismousedown = false;
	let hasFocus = true;
	let changeToErase = false;

	setInterval(() => {
		timeToSendMouseMoveEvent = true;
		hasFocus = document.hasFocus()
	}, minDurationMouseMove);

	document.getElementById("canvas").oncontextmenu = (evt) => evt.preventDefault();
	document.getElementById("canvas").onpointerdown = (evt) => {
		evt.preventDefault();
		if (hasFocus) {
			ismousedown = true;
			if (evt.button == 2 && UserManager.me.isToolDraw) {
				changeToErase = true;
				Share.execute("switchEraser", [UserManager.me.userID]);
			}
			else
				changeToErase = false;
			window["ismousedown"] = true;
			Share.execute("mousedown", [UserManager.me.userID, evt])
		}
	};

	document.getElementById("canvas").onpointermove = (evt) => {
		evt.preventDefault();
		const point = { x: evt.offsetX, y: evt.offsetY };
		window["point"] = point;
		S.onmousemove(point);

		if ((ismousedown && UserManager.me.canWrite) || timeToSendMouseMoveEvent) {
			Share.execute("mousemove", [UserManager.me.userID, evt]);
			timeToSendMouseMoveEvent = false; //prevent sending the mousemove event
		}


	};
	document.getElementById("canvas").onpointerup = (evt) => {
		evt.preventDefault();
		ismousedown = false;
		window["ismousedown"] = false;
		Share.execute("mouseup", [UserManager.me.userID, evt])
		if (changeToErase)
			Share.execute("switchDraw", [UserManager.me.userID]);
	};

	//onpointerleave: stop the drawing to prevent bugs (like it draws a small line)
	document.getElementById("canvas").onpointerleave = (evt) => {
		evt.preventDefault();
		ismousedown = false;
		window["ismousedown"] = false;
		Share.execute("mouseup", [UserManager.me.userID, evt])
	};
	//document.getElementById("canvas").onmousedown = mousedown;

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


