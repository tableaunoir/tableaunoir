import { CSSStyleModifier } from './CSSStyleModifier';
import { BoardNavigation } from './BoardNavigation';
import { CircularMenu } from './CircularMenu';
import { ToolMenu } from './ToolMenu';
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
import { Translation } from './Translation';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { Drawing } from './Drawing'
import { ToolDraw } from './ToolDraw';

window.onload = load;
window['Menu'] = Menu; //for Menu to be used in index.html


window['testSVG'] = () => {
	for (let x = 0; x < 500; x += 4)
		for (let y = 0; y < 1000; y += 4) {
			const svgLine = ToolDraw.addSVGLine(x, y, x + 2, y + 1, 0.5, "yellow");
			document.getElementById("svg").appendChild(svgLine);
		}

}

window['testCanvas'] = () => {
	for (let x = 0; x < 500; x += 4)
		for (let y = 0; y < 1000; y += 4) {
			Drawing.drawLine(getCanvas().getContext("2d"), x, y, x + 2, y + 1, 0.5, "yellow");
		}

}

export const palette = new Palette();
const toolmenu = new ToolMenu();

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
	installBodyNoScroll();

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
	CSSStyleModifier.init();
	Drawing.init();
	BoardNavigation.init();

	const changeColor = () => {
		if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
			if (!UserManager.me.tool.isDrawing)
				palette.show({ x: UserManager.me.tool.x, y: UserManager.me.tool.y });
			palette.next();
		}
		else { // if there is a magnet change the background of the magnet
			const magnet = MagnetManager.getMagnetUnderCursor();
			magnet.style.backgroundColor = MagnetManager.nextBackgroundColor(magnet.style.backgroundColor);
		}
	}

	const previousColor = () => {
		if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
			UserManager.me.switchChalk();

			if (!UserManager.me.tool.isDrawing)
				palette.show({ x: UserManager.me.tool.x, y: UserManager.me.tool.y });
			palette.previous();
		}
		else { // if there is a magnet change the background of the magnet
			const magnet = MagnetManager.getMagnetUnderCursor();
			magnet.style.backgroundColor = MagnetManager.previousBackgroundColor(magnet.style.backgroundColor);
		}
	}

	const switchChalkEraser = () => {
		if (!UserManager.me.isToolDraw)
			Share.execute("switchChalk", [UserManager.me.userID]);
		else
			Share.execute("switchErase", [UserManager.me.userID]);


	}


	document.getElementById("buttonMenu").onclick = Menu.toggle;
	document.getElementById("buttonColors").onclick = changeColor;

	document.getElementById("buttonChalk").onclick = switchChalkEraser;
	document.getElementById("buttonEraser").onclick = switchChalkEraser;

	document.getElementById("buttonTools").onclick = () => {
		toolmenu.show({ x: UserManager.me.x, y: UserManager.me.y });
	}

	document.getElementById("buttonText").onclick = () => MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
	document.getElementById("buttonDivide").onclick = () => Drawing.divideScreen(UserManager.me.userID);

	document.getElementById("buttonLeft").onclick = BoardNavigation.leftPreviousPage;
	document.getElementById("buttonRight").onclick = BoardNavigation.rightNextPage;
	document.getElementById("buttonCancel").onclick = () => Share.execute("cancel", [UserManager.me.userID]);
	document.getElementById("buttonRedo").onclick = () => Share.execute("redo", [UserManager.me.userID]);

	document.getElementById("buttonAskQuestion").onclick = Discussion.askQuestion;



	const buttons = document.getElementById("controls").children;

	for (let i = 0; i < buttons.length; i++)
		if (buttons[i] instanceof HTMLButtonElement)
			(<HTMLButtonElement>buttons[i]).onfocus = (<HTMLElement>document.activeElement).blur; //to be improved

	BlackVSWhiteBoard.init();

	palette.onchange = () => {
		if (UserManager.me.isToolErase)
			Share.execute("switchChalk", [UserManager.me.userID]);
		Share.execute("setCurrentColor", [UserManager.me.userID, palette.getCurrentColor()]);
	}


	document.onkeydown = (evt) => {
		//console.log("ctrl: " + evt.ctrlKey + " shift:" + evt.shiftKey + "key: " + evt.key)
		if (evt.key == "Backspace" && !(document.activeElement instanceof HTMLInputElement))
			evt.preventDefault();

		if (evt.key == "Escape" || evt.key == "F1") {//escape => show menu
			if (Layout.isMinimap)
				Layout.normal();
			else if (CircularMenu.isShown())
				CircularMenu.hide();
			else
				Menu.toggle();
		}

		if (Menu.isShown())
			return;

		if (!evt.ctrlKey && !evt.shiftKey && evt.key == "n") { //navigation
			if (Layout.isMinimap)
				Layout.normal();
			else
				Layout.minimap();
		}
		else if (!evt.ctrlKey && !evt.shiftKey && evt.key == "c") // c => change color
			changeColor();
		else if (!evt.ctrlKey && evt.shiftKey && evt.key == "C")
			previousColor();
		else if (!evt.ctrlKey && !evt.shiftKey && evt.key == "t") { // t => tool menu 
			toolmenu.show({ x: UserManager.me.x, y: UserManager.me.y });
		}
		else if (evt.key == "Enter" && CircularMenu.isShown())
			CircularMenu.hide();
		else if (evt.key == "ArrowLeft" && CircularMenu.isShown())
			palette.previous();
		else if (evt.key == "ArrowRight" && CircularMenu.isShown())
			palette.next();
		else if (evt.key == "Enter") {
			MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
			evt.preventDefault(); //so that it will not add "new line" in the text element
		}
		else if (evt.shiftKey && evt.key == "ArrowLeft") {
			BoardNavigation.left();
		}
		else if (evt.shiftKey && evt.key == "ArrowRight") {
			BoardNavigation.right();
		}
		else if (evt.key == "ArrowLeft") {
			BoardNavigation.leftPreviousPage();
		}
		else if (evt.key == "ArrowRight") {
			BoardNavigation.rightNextPage();
		}
		else if (evt.key == "d")  //d = divide screen
			Drawing.divideScreen(UserManager.me.userID);
		else if ((evt.ctrlKey && evt.shiftKey && evt.key == "Z") || (evt.ctrlKey && evt.key == "y")) { //ctrl + shift + z OR Ctrl + Y = redo
			Share.execute("redo", [UserManager.me.userID]);
			evt.preventDefault();
		}
		else if (evt.ctrlKey && evt.key == "z") {// ctrl + z = undo
			Share.execute("cancel", [UserManager.me.userID]);
			evt.preventDefault();
		}

		else if (evt.key == "e")  //e = switch eraser and chalk
			switchChalkEraser();
		else if (evt.key == "h")
			Toolbar.toggle();
		else if (evt.ctrlKey && evt.key.toLowerCase() == 'x') {//Ctrl + x
			CircularMenu.hide();
			if (!UserManager.me.isDelineation)
				return;
			const deli = UserManager.me.lastDelineation;
			if (deli.containsPolygonToMagnetize())
				deli.magnetize({ cut: true, removeContour: evt.key == "x" });
		}
		else if (evt.ctrlKey && evt.key.toLowerCase() == 'c') {//Ctrl + c
			CircularMenu.hide();
			if (!UserManager.me.isDelineation)
				return;
			const deli = UserManager.me.lastDelineation;
			if (deli.containsPolygonToMagnetize())
				deli.magnetize({ cut: false, removeContour: evt.key == "c" });
			evt.preventDefault();
		}
		else if (evt.ctrlKey && evt.key == "v") { //Ctrl + v = print the current magnet
			CircularMenu.hide();
			Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
		}
		else if (evt.key.toLowerCase() == "m") { //m = make new magnets
			CircularMenu.hide();
			if (!UserManager.me.isDelineation) {
				Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
				MagnetManager.removeCurrentMagnet();
			}
			else {
				const deli = UserManager.me.lastDelineation;
				if (deli.containsPolygonToMagnetize()) {
					deli.magnetize({ cut: true, removeContour: evt.key == "m" });
				}
				else {
					Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
					MagnetManager.removeCurrentMagnet();
				}
			}
		}
		else if (evt.key == "p") { //p = print the current magnet
			CircularMenu.hide();
			Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
		}
		else if (evt.key == "Delete" || evt.key == "x" || evt.key == "Backspace") { //supr = delete the current magnet
			CircularMenu.hide();
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



export function getContainer(): HTMLElement {
	return document.getElementById("container");
}


