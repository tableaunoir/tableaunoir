import { Sound } from './Sound';
import { UserManager } from './UserManager';
import { ToolDraw } from './ToolDraw';
import { Geometry } from './Geometry';
import { ConstraintDrawing } from './ConstraintDrawing';
import { ErrorMessage } from './ErrorMessage';
import { getCanvas } from "./main";
import { Share } from "./share";
import { BoardManager } from './boardManager';
import { Layout } from './Layout';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { ActionPrintMagnet } from './ActionPrintMagnet';


export class MagnetManager {

	static magnetX = 0;
	static magnetY = 64;
	static currentMagnet = undefined; // last magnet used
	static magnetUnderCursor = undefined;


	static getMagnetNearPoint({ x, y }: { x: number, y: number }): HTMLElement {
		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++) {
			if (MagnetManager.magnetNearContains(magnets[i], x, y))
				return magnets[i];
		}
		return null;
	}

	static getMagnetNearestFromPoint({ x, y }: { x: number, y: number }): HTMLElement {
		const magnets = MagnetManager.getMagnets();
		let magnet = null;
		let d = 99999999;
		for (let i = 0; i < magnets.length; i++) {
			const m = MagnetManager.getMagnetCenter(magnets[i]);
			const dd = Geometry.distance(m, { x: x, y: y });
			if (dd < d) {
				magnet = magnets[i];
				d = dd;
			}

		}
		return magnet;
	}


	/**
	 * initialization
	 */
	static init(): void {
		document.getElementById("clearMagnet").onclick = MagnetManager.clearMagnet;
		document.getElementById("magnetsArrange").onclick = MagnetManager.arrange;
		document.getElementById("magnetsCreateGraph").onclick = MagnetManager.drawGraph;
	}


	/**
	 * @returns the magnet under the cursor
	 */
	static getMagnetUnderCursor(): HTMLElement { return MagnetManager.magnetUnderCursor; }


	/**
	 * @returns true iff there is a current magnet
	 */
	static hasCurrentMagnet(): boolean { return MagnetManager.currentMagnet == undefined; }


	/**
	 * @description set that there is no current magnet
	 */
	static noCurrentMagnet(): void { MagnetManager.currentMagnet = undefined; }


	/**
	 * @returns the ID of the current magnet
	 */
	static getCurrentMagnetID(): string { return MagnetManager.currentMagnet.id; }



	/**
	 *
	 * @param {boolean} b
	 * @description if b == true, makes all the magnets interactable with the mouse/pointer
	 *  if b == false, the magnets cannot be moved
	 */
	static setInteractable(b: boolean): void {
		const v = b ? "auto" : "none";

		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++)
			(<HTMLElement>magnets[i]).style.pointerEvents = v;

	}

	/**
	 * @returns an array containing all the magnets
	 */
	static getMagnets(): HTMLCollectionOf<HTMLElement> {
		return <HTMLCollectionOf<HTMLElement>>document.getElementsByClassName("magnet");
	}


	/**
	 * @returns the top Y when a set of magnets is automatically arranged
	 */
	static getYTopWhenNewMagnets(): number { return 64; }

	/**
	 * delete all the magnets
	 */
	static clearMagnet(): void {
		MagnetManager.currentMagnet = undefined;
		const magnets = MagnetManager.getMagnets();

		while (magnets.length > 0)
			magnets[0].remove();

		Share.sendMagnets();

		Menu.hide();
	}


	static resetPositionate(): void {
		MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
		MagnetManager.magnetY = MagnetManager.getYTopWhenNewMagnets();
	}


	/**
	* @param {*} element
	* @description add the DOM element element to the list of magnets. This function also gives a position to the element (typically for collection of magnets)
	*/
	static addMagnetAndPositionnate(element: HTMLElement): void {
		if (MagnetManager.magnetX > BoardManager.getCurrentScreenRectangle().x2 - 10) {
			MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
			MagnetManager.magnetY += 64;
		}
		if (element.style.left == "") {
			element.style.left = MagnetManager.magnetX + "px";
			element.style.top = MagnetManager.magnetY + "px";
		}
		MagnetManager.magnetX += 64;
		MagnetManager.addMagnet(element);
	}

	/**
	 *
	 * @param {*} element
	 * @description add the DOM element element to the list of magnets
	 */
	static addMagnet(element: HTMLElement): void {
		if (element.id == "")
			element.id = MagnetManager.generateID();
		MagnetManager.currentMagnet = element;
		element.classList.add("magnet");
		document.getElementById("magnets").appendChild(element);

		const f = () => {
			if (Share.isShared())
				Share.sendNewMagnet(element);
		}

		if (element.tagName == "IMG")
			element.addEventListener("load", f);
		else
			f();

		MagnetManager._installMagnet(element);
	}

	/**
	 * @returns a new ID for a new magnet
	 */
	static generateID(): string {
		let id = "";
		do {
			id = "m" + Math.round(Math.random() * 1000000);
		} while (document.getElementById(id) != undefined)
		return id;
	}



	/**
	 *
	 * @param {*} element
	 * @description add the DOM element element to the list of magnets (but do not send to other users)
	 */
	static addMagnetLocalOnly(element: HTMLElement): void {
		if (element.id == "")
			element.id = MagnetManager.generateID();
		MagnetManager.currentMagnet = element;
		element.classList.add("magnet");
		document.getElementById("magnets").appendChild(element);
		MagnetManager._installMagnet(element);
	}


	/**
	 * 
	 * @param m 
	 * @param x 
	 * @param y 
	 * @returns true if (x, y) is inside magnet m
	 */
	static magnetContains(m: HTMLElement, x: number, y: number): boolean {
		return (parseInt(m.style.left) <= x && parseInt(m.style.top) <= y &&
			x <= parseInt(m.style.left) + (m.clientWidth) &&
			y <= parseInt(m.style.top) + (m.clientHeight));
	}


	/**
	 * 
	 * @param m 
	 * @param x 
	 * @param y 
	 * @returns true iff point (x, y) is very close to magnet m
	 */
	static magnetNearContains(m: HTMLElement, x: number, y: number): boolean {
		const nbpixelsTheshold = 24;
		return (parseInt(m.style.left) - nbpixelsTheshold <= x && parseInt(m.style.top) - nbpixelsTheshold <= y &&
			x <= parseInt(m.style.left) + (m.clientWidth) + nbpixelsTheshold &&
			y <= parseInt(m.style.top) + (m.clientHeight) + nbpixelsTheshold);
	}

	/**
	 * @description put the existing magnets on the current screen
	 */
	static arrange(): void {
		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++) {
			const magnet = magnets[i];
			let x = undefined;
			let y = undefined;


			const dist = () => {
				let minDist = 100000;
				for (let j = 0; j < magnets.length; j++) {
					minDist = Math.min(minDist,
						Math.abs(x - parseInt((<HTMLElement>magnets[j]).style.left)) + Math.abs(y - parseInt((<HTMLElement>magnets[j]).style.top)));
				}
				return minDist;

			}

			const contains = () => {
				for (let j = 0; j < magnets.length; j++) {
					if (MagnetManager.magnetContains(magnets[j], x, y) ||
						MagnetManager.magnetContains(magnets[j], x + magnet.clientWidth, y + magnet.clientHeight))
						return true;
				}
				return false;
			}

			const rect = BoardManager.getCurrentScreenRectangle();

			const generatePosition = () => {
				let count = 0;
				const margin = 32;
				do {
					x = rect.x1 + (Math.random() * Layout.getWindowWidth());
					y = rect.y1 + (Math.random() * 3 * Layout.getWindowHeight() / 4);

					x = Math.max(x, rect.x1 + margin);
					y = Math.max(y, rect.y1 + margin);
					x = Math.min(x, rect.x2 - magnet.clientWidth - margin);
					y = Math.min(y, rect.y2 - magnet.clientHeight - margin);
					count++;
				}
				while (contains() && count < 50)
			}


			let count = 0;
			let bestDist = 0;
			let bestX = undefined;
			let bestY = undefined;

			while (count < 30) {

				generatePosition();

				if (bestDist < dist()) {
					bestX = x;
					bestY = y;
					bestDist = dist();
				}
				count++;
			}

			magnet.style.left = bestX;
			magnet.style.top = bestY;
		}

	}



	static getMagnetCenter(m: HTMLElement): { x: number, y: number } {
		return { x: parseInt(m.style.left) + m.clientWidth / 2, y: parseInt(m.style.top) + m.clientHeight / 2 }
	}
	/**
	 * @returns the array of center points of existing magnets
	 */
	static getNodes(): { magnet: HTMLElement, x: number, y: number }[] {
		const magnets = MagnetManager.getMagnets();
		const nodes = [];
		for (let i = 0; i < magnets.length; i++) {
			const m = magnets[i];
			const p = MagnetManager.getMagnetCenter(m)

			nodes.push({ magnet: m, x: p.x, y: p.y });
		}
		//	console.log(nodes)
		return nodes;
	}

	/**
	 * @description make a graph where the nodes are the magnets
	 */
	static drawGraph(): void {
		MagnetManager.arrange();

		const nodes = MagnetManager.getNodes();
		const edges = [];
		for (let i = 0; i < nodes.length; i++) {
			edges[i] = [];
			for (let j = 0; j < nodes.length; j++) { edges[i][j] = 0; }
		}

		// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
		function intersects(a: number, b: number, c: number, d: number, p: number, q: number, r: number, s: number) {
			const det = (c - a) * (s - q) - (r - p) * (d - b);
			if (det === 0) {
				return false;
			} else {
				const lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
				const gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
				return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
			}
		}

		const isCrossing = (i: number, j: number) => {
			for (let k = 0; k < nodes.length; k++)
				for (let l = 0; l < nodes.length; l++)
					if (edges[k][l]) {
						if (intersects(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, nodes[k].x, nodes[k].y, nodes[l].x, nodes[l].y))
							return true;
					}
			return false;
		}

		for (let i = 0; i < nodes.length; i++)
			for (let j = 0; j < nodes.length; j++) {
				if (Math.abs(nodes[i].x - nodes[j].x) + Math.abs(nodes[i].y - nodes[j].y) < 400 && !isCrossing(i, j)) {
					edges[i][j] = 1;
					const line = ToolDraw.addSVGLine(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, 2.0, UserManager.me.color);
					ConstraintDrawing.freeDraw([line], nodes[i].magnet.id, nodes[j].magnet.id);
				}
			}


	}


	/**
	 * @description adds the event mousedown etc. to the magnets. Call LaTEX
	 */
	static installMagnets(): void {
		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++)
			MagnetManager._installMagnet(magnets[i]);

		eval("MathJax.typeset();");

	}




	/**
	 * @param element 
	 * @description set the z-index of the element depending on the size of the element
	 */
	static setZIndex(element: HTMLElement): void {
		const f = () => { const LARGENUMBER = 10000; element.style.zIndex = "" + (LARGENUMBER - element.clientWidth); };

		if (element.tagName == "IMG")
			element.addEventListener("load", f);
		else
			f();

	}



	/**
	 * 
	 * @param element 
	 * @returns a copy of the element, ready to be given to addMagnet
	 */
	private static createCopyMagnet(element: HTMLElement): HTMLElement {
		const copy = <HTMLElement>element.cloneNode(true);
		copy.id = ""; //remove the ID so that a new ID will be given
		return copy;
	}




	/**
	 * 
	 * @param element 
	 * @description remove the focus on the magnet (it is a text magnet for instance)
	 */
	private static magnetUnFocus(element: HTMLElement) {
		element.blur();
		if (element.children.length > 0)
			(<HTMLElement>element.children[0]).blur();
	}
	/**
	 * 
	 * @param element 
	 * @description makes that the magnet is draggable
	 */
	private static makeDraggableElement(element: HTMLElement): void {
		let dx = 0, dy = 0, x = 0, y = 0;

		element.addEventListener("pointerdown", dragMouseDown);

		TouchScreen.addTouchEvents(element);

		let otherElementsToMove = [];
		let canvasCursorStore = undefined;
		let drag = true;


		function dragMouseDown(evt) {
			drag = true;
			MagnetManager.currentMagnet = element;

			if (evt.ctrlKey) {
				/**makes a copy. The copy does not move. */
				const copy = MagnetManager.createCopyMagnet(element);
				MagnetManager.addMagnet(copy);
				Share.execute("magnetMove", [copy.id, element.style.left, element.style.top]);
			}
			/**
			 * 
			 * @param {*} element 
			 * @param {*} bigElement 
			 * @returns true if element is inside bigElement
			 */
			function inside(element, bigElement) {
				return element.offsetLeft > bigElement.offsetLeft && element.offsetTop > bigElement.offsetTop &&
					element.offsetLeft + element.clientWidth < bigElement.offsetLeft + bigElement.clientWidth &&
					element.offsetTop + element.clientHeight < bigElement.offsetTop + bigElement.clientHeight;
			}

			const canvas = getCanvas();
			canvasCursorStore = canvas.style.cursor;
			evt = evt || window.event;
			evt.preventDefault(); //to avoid the drag/drop by the browser
			// get the mouse cursor position at startup:

			x = evt.clientX * Layout.getZoom();
			y = evt.clientY * Layout.getZoom();


			MagnetManager.magnetUnFocus(element);
			document.onpointermove = elementDrag;
			document.onpointerup = closeDragElement;
			//document.onmouseup = closeDragElement;


			const magnets = MagnetManager.getMagnets();
			otherElementsToMove = [];

			for (let i = 0; i < magnets.length; i++)
				if (magnets[i] != element && inside(magnets[i], element))
					otherElementsToMove.push(magnets[i]);
		}



		function elementDrag(e) {
			if (!drag) return;

			MagnetManager.currentMagnet = element;
			e.target.classList.add("magnetDrag");

			const canvas = getCanvas();
			canvas.style.cursor = "none";

			e = e || window.event;
			e.preventDefault();
			// calculate the new cursor position:
			dx = x - e.clientX * Layout.getZoom();
			dy = y - e.clientY * Layout.getZoom();
			x = e.clientX * Layout.getZoom();
			y = e.clientY * Layout.getZoom();



			// set the element's new position:
			Share.execute("magnetMove", [element.id, element.offsetLeft - dx, element.offsetTop - dy]);

			for (const el of otherElementsToMove)
				Share.execute("magnetMove", [el.id, el.offsetLeft - dx, el.offsetTop - dy]);


			ConstraintDrawing.update();
		}

		function closeDragElement() {
			if (!drag)
				return;

			drag = false;
			console.log("close drag")

			const magnets = MagnetManager.getMagnets();

			for (let i = 0; i < magnets.length; i++) {
				magnets[i].classList.remove("magnetDrag");
			}

			getCanvas().style.cursor = canvasCursorStore;

			// stop moving when mouse button is released:
			document.onmouseup = null;
			document.onmousemove = null;
		}
	}



	/**
	 * 
	 * @param element 
	 * @description adds the event mousedown etc. to the magnet. Call LaTEX
	 */
	static _installMagnet(element: HTMLElement): void {
		if (element.classList.contains("magnetText"))
			MagnetManager.installMagnetText(element);

		MagnetManager.makeDraggableElement(element);
		MagnetManager.setZIndex(element);

		element.onmouseenter = () => { MagnetManager.magnetUnderCursor = element };
		element.onmouseleave = () => { MagnetManager.magnetUnderCursor = undefined };

	}




	/**
	 * 
	 * @param element 
	 * @param LaTEXCode 
	 * @description update the magnet element to be the rendering of the latex code LaTEXCode
	 */
	static setLaTEX(element: HTMLElement, LaTEXCode: string): void {
		const divText = <HTMLElement>element.children[0];
		element.dataset.type = "LaTEX";
		element.dataset.code = LaTEXCode;
		divText.contentEditable = "false";
		divText.innerHTML = `\\[${element.dataset.code}\\]`;
		eval("MathJax.typeset();");

		if (Share.isShared())
			Share.sendMagnetChanged(element);
	}
	/**
	 *
	 * @param element
	 * @description set up the text magnet: add the mouse event, key event for editing the text magnet
	 */
	static installMagnetText(element: HTMLElement): void {

		const divText = <HTMLElement>element.children[0];

		element.ondblclick = () => {
			if (element.dataset.type == "LaTEX") {
				const answer = prompt("Type the LaTEX code:", element.dataset.code);

				if (answer)
					MagnetManager.setLaTEX(element, answer);
			}
		}

		divText.onpointerdown = (e) => { e.stopPropagation(); }
		divText.onpointermove = (e) => { e.stopPropagation(); }
		divText.onpointerup = (e) => {
			if (document.activeElement == divText) //if edit mode then the click should stop here
				e.stopPropagation();
			//otherwise, we do not stop (maybe the magnet is dragged! #144)
		}

		divText.onkeydown = (e) => {
			const setFontSize = (size) => {
				divText.style.fontSize = size + "px";
				for (const i in divText.children) {
					(<HTMLElement>divText.children[i]).style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape") {
				divText.blur();

				const text = divText.innerHTML;

				if (text.startsWith("$") && text.endsWith("$")) { //the magnet is transformed into a LaTEX magnet
					MagnetManager.setLaTEX(element, text.substring(1, text.length - 1));
				}
				else if (text.startsWith("\\[") && text.endsWith("\\]")) {
					MagnetManager.setLaTEX(element, text.substring(2, text.length - 2));
				}
				else //else there may be some standard LaTEX "\[...\]" inside the text magnet
					eval("MathJax.typeset();")
				window.getSelection().removeAllRanges();
				/*if(divText.innerHTML == "")
					MagnetManager.remove(div);*/
			}
			if ((e.ctrlKey && e.key == "=") || (e.ctrlKey && e.key == "+")) { // Ctrl + +

				let size = parseInt(divText.style.fontSize);
				size++;
				setFontSize(size);
				e.preventDefault();
			}
			else if (e.ctrlKey && e.key == "-") { // Ctrl + -
				let size = parseInt(divText.style.fontSize);
				if (size > 6) size--;
				setFontSize(size);
				e.preventDefault();
			}


			e.stopPropagation();
		}

		divText.onkeyup = evt => {
			if (Share.isShared())
				Share.sendMagnetChanged(element);
			evt.stopPropagation();
		};
	}


	/**
	 *
	 * @param {*} x
	 * @param {*} y
	 * @description adds a new magnet text at position x and y
	 */
	static addMagnetText(x: number, y: number): void {
		const div = document.createElement("div");
		const divText = document.createElement("div");

		div.appendChild(divText);
		divText.innerHTML = "type text";
		divText.contentEditable = "true";
		divText.style.fontSize = "24px";
		divText.style.color = UserManager.me.color;
		div.classList.add("magnetText");

		div.style.left = x + "px";
		div.style.top = y + "px";
		MagnetManager.addMagnet(div);

		divText.focus();

		if (Share.isShared())
			Share.sendMagnetChanged(div);

		document.execCommand('selectAll', false, null);
	}


	/**
	 * @description remove the current magnet
	 */
	static removeCurrentMagnet(): void {
		if (MagnetManager.currentMagnet == undefined)
			return;
		if (!MagnetManager.currentMagnet.classList.contains("magnet"))
			ErrorMessage.show("oups, important bug. The application wanted to delete something else than a magnet!");

		Share.execute("magnetRemove", [MagnetManager.currentMagnet.id]);
	}

	/**
	 *
	 * @param {*} id
	 * @description remove the magnet of id
	 */
	static magnetRemove(id: string): void {
		document.getElementById(id).remove();
		//		document.getElementById(id).style.top = "-1000";
		MagnetManager.currentMagnet == undefined;
		MagnetManager.magnetUnderCursor = undefined;
		ConstraintDrawing.update();
	}


	/**
	 * @param img
	 * @description draw the current magnet to the canvas
	 */
	static printMagnet(img: HTMLElement): void {

		if (!(img instanceof Image)) {
			console.log("the current image is not an image! Could not be printed!")
			return;
		}

		const x = parseInt(img.style.left);
		const y = parseInt(img.style.top);

		Sound.play("magnetprint");

		const action = new ActionPrintMagnet(UserManager.me.userID, img, x, y);
		action.redo();

		BoardManager.addAction(action);
	}



	static magnetColors = ['', 'rgb(255, 128, 0)', 'rgb(0, 128, 0)', 'rgb(192, 0, 0)', 'rgb(0, 0, 255)'];

	static nextBackgroundColor(color: string): string {
		for (let i = 0; i < MagnetManager.magnetColors.length; i++) {
			if (MagnetManager.magnetColors[i] == color) {
				return MagnetManager.magnetColors[(i + 1) % MagnetManager.magnetColors.length];
			}
		}
		return MagnetManager.magnetColors[0];
	}


	static previousBackgroundColor(color: string): string {
		for (let i = 0; i < MagnetManager.magnetColors.length; i++) {
			if (MagnetManager.magnetColors[i] == color) {
				return MagnetManager.magnetColors[(i - 1) % MagnetManager.magnetColors.length];
			}
		}
		return MagnetManager.magnetColors[0];
	}


}
