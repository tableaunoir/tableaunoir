import { Palette } from "./Palette";
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
import { ErrorMessage } from './ErrorMessage';
import { Translation } from './Translation';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { ShareEvent } from './ShareEvent';
import { Drawing } from './Drawing'

window.onload = load;
window['Menu'] = Menu;
window['ShareEvent'] = ShareEvent;

export const palette = new Palette();

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
//	try {

		installBodyNoScroll();

	/*	if (loaded)
			return;*/

		UserManager.init();


		Background.init();
		Layout.init();

		Translation.init();
		ChalkCursor.init();
		LoadSave.init();
		BoardManager.init();
		Menu.init();
		Share.init();
		Toolbar.init();
		Discussion.init();



		const changeColor = () => {
			if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
				//if (!isDrawing)
				palette.show({ x: UserManager.me.x, y: UserManager.me.y });
				palette.next();
			}
			else { // if there is a magnet change the background of the magnet
				const magnet = MagnetManager.getMagnetUnderCursor();
				magnet.style.backgroundColor = MagnetManager.nextBackgroundColor(magnet.style.backgroundColor);
			}
		}

		const previousColor = () => {
			if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
				UserManager.me.eraseMode = false;

				if (!UserManager.me.isDrawing)
					palette.show({ x: UserManager.me.x, y: UserManager.me.y });
				palette.previous();
			}
			else { // if there is a magnet change the background of the magnet
				const magnet = MagnetManager.getMagnetUnderCursor();
				magnet.style.backgroundColor = MagnetManager.previousBackgroundColor(magnet.style.backgroundColor);
			}
		}

		const switchChalkEraser = () => {
			if (UserManager.me.eraseMode)
				Share.execute("switchChalk", [UserManager.me.userID]);
			else
				Share.execute("switchErase", [UserManager.me.userID]);


		}


		document.getElementById("buttonMenu").onclick = Menu.toggle;
		document.getElementById("buttonColors").onclick = changeColor;

		document.getElementById("buttonChalk").onclick = switchChalkEraser;
		document.getElementById("buttonEraser").onclick = switchChalkEraser;

		document.getElementById("buttonText").onclick = () => MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
		document.getElementById("buttonDivide").onclick = Drawing.divideScreen;

		document.getElementById("buttonLeft").onclick = BoardManager.leftPreviousPage;
		document.getElementById("buttonRight").onclick = BoardManager.rightNextPage;
		document.getElementById("buttonCancel").onclick = () => Share.execute("cancel", []);
		document.getElementById("buttonRedo").onclick = () => Share.execute("redo", []);

		document.getElementById("buttonAskQuestion").onclick = Discussion.askQuestion;



		const buttons = document.getElementById("controls").children;

		for (let i = 0; i < buttons.length; i++)
			if (buttons[i] instanceof HTMLButtonElement)
				(<HTMLButtonElement>buttons[i]).onfocus = (<HTMLElement>document.activeElement).blur; //to be improved

		BlackVSWhiteBoard.init();

		palette.onchange = () => {
			Share.execute("switchChalk", [UserManager.me.userID]);
			Share.execute("setCurrentColor", [UserManager.me.userID, palette.getCurrentColor()]);
		}


		document.onkeydown = (evt) => {
			//console.log("ctrl: " + evt.ctrlKey + " shift:" + evt.shiftKey + "key: " + evt.key)
			if (evt.key == "Backspace" && !(document.activeElement instanceof HTMLInputElement))
				evt.preventDefault();

			if (evt.key == "Escape" || evt.key == "F1") {//escape => show menu
				if (palette.isShown())
					palette.hide();
				else
					Menu.toggle();
			}

			if (Menu.isShown())
				return;

			if (!evt.ctrlKey && !evt.shiftKey && evt.key == "c") // c => change color
				changeColor();
			else if (!evt.ctrlKey && evt.shiftKey && evt.key == "C")
				previousColor();
			else if (evt.key == "Enter" && palette.isShown())
				palette.hide();
			else if (evt.key == "ArrowLeft" && palette.isShown())
				palette.previous();
			else if (evt.key == "ArrowRight" && palette.isShown())
				palette.next();
			else if (evt.key == "Enter") {
				MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
				evt.preventDefault(); //so that it will not add "new line" in the text element
			}
			else if (evt.shiftKey && evt.key == "ArrowLeft") {
				BoardManager.left();
			}
			else if (evt.shiftKey && evt.key == "ArrowRight") {
				BoardManager.right();
			}
			else if (evt.key == "ArrowLeft") {
				BoardManager.leftPreviousPage();
			}
			else if (evt.key == "ArrowRight") {
				BoardManager.rightNextPage();
			}
			else if (evt.key == "d")  //d = divide screen
				Drawing.divideScreen();
			else if ((evt.ctrlKey && evt.shiftKey && evt.key == "Z") || (evt.ctrlKey && evt.key == "y")) { //ctrl + shift + z OR Ctrl + Y = redo
				Share.execute("redo", []);
				evt.preventDefault();
			}
			else if (evt.ctrlKey && evt.key == "z") {// ctrl + z = undo
				Share.execute("cancel", []);
				evt.preventDefault();
			}

			else if (evt.key == "e")  //e = switch eraser and chalk
				switchChalkEraser();
			else if (evt.key == "h")
				Toolbar.toggle();
			else if (evt.ctrlKey && evt.key == 'x') {//Ctrl + x
				palette.hide();
				if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
					UserManager.me.lastDelineation.cutAndMagnetize();
			}
			else if (evt.ctrlKey && evt.key == 'c') {//Ctrl + c
				palette.hide();
				if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
					UserManager.me.lastDelineation.copyAndMagnetize();
			}
			else if (evt.ctrlKey && evt.key == "v") { //Ctrl + v = print the current magnet
				palette.hide();
				Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
			}
			else if (evt.key == "m") { //m = make new magnets
				palette.hide();
				if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
					UserManager.me.lastDelineation.cutAndMagnetize();
				else {
					Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
					MagnetManager.removeCurrentMagnet();
				}
			}
			else if (evt.key == "p") { //p = print the current magnet
				palette.hide();
				Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
			}
			else if (evt.key == "Delete" || evt.key == "x" || evt.key == "Backspace") { //supr = delete the current magnet
				palette.hide();
				/*if (lastDelineation.containsPolygonToMagnetize())
					lastDelineation.erase();
				else*/
				MagnetManager.removeCurrentMagnet();
				evt.preventDefault();
			}

		};


		document.getElementById("canvas").onpointerdown = (evt) => {
			evt.preventDefault();
			Share.execute("mousedown", [UserManager.me.userID, evt])
		};
		document.getElementById("canvasBackground").onpointermove = () => { console.log("mousemove on the background should not occur") };

		document.getElementById("canvas").onpointermove = (evt) => {
			evt.preventDefault();
			Share.execute("mousemove", [UserManager.me.userID, evt])
		};
		document.getElementById("canvas").onpointerup = (evt) => {
			evt.preventDefault();
			Share.execute("mouseup", [UserManager.me.userID, evt])
		};

		//onpointerleave: stop the drawing to prevent bugs (like it draws a small line)
		document.getElementById("canvas").onpointerleave = (evt) => {
			evt.preventDefault();
			Share.execute("mouseup", [UserManager.me.userID, evt])
		};
		//document.getElementById("canvas").onmousedown = mousedown;

		TouchScreen.addTouchEvents(document.getElementById("canvas"));




		//	document.getElementById("canvas").onmouseleave = function (evt) { isDrawing = false; }

		MagnetManager.init();
		MyMagnets.loadMagnets();

		BoardManager.load();
		//loaded = true;
//}
	/*catch (e) {
		ErrorMessage.show(e);
		loaded = false;
	}*/
}



export function getCanvas(): HTMLCanvasElement {
	return <HTMLCanvasElement>document.getElementById("canvas");
}


export function getCanvasBackground(): HTMLCanvasElement {
	return <HTMLCanvasElement>document.getElementById("canvasBackground");
}



export function getContainer():HTMLElement {
	return document.getElementById("container");
}


