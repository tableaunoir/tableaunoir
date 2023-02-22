import { S } from './Script';
import MagnetTextManager from './MagnetTextManager';
import { ActionMagnetDelete } from './ActionMagnetDelete';
import { ActionMagnetNew } from './ActionMagnetNew';
import { Sound } from './Sound';
import { UserManager } from './UserManager';
import { ToolDraw } from './ToolDraw';
import { Geometry } from './Geometry';
import { ConstraintDrawing } from './ConstraintDrawing';
import { ShowMessage } from './ShowMessage';
import { getCanvas } from "./main";
import { Share } from "./share";
import { BoardManager } from './boardManager';
import { Layout } from './Layout';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { ActionPrintMagnet } from './ActionPrintMagnet';




export class MagnetManager {
	static currentMagnet = undefined; // last magnet used
	static magnetUnderCursor = undefined;


	/**
	 * 
	 * @param magnet 
	 * @returns true if the magnet is visible
	 * Remark: invisible magnets are magnets have been deleted
	 */
	static isVisible(magnet: HTMLElement): boolean { return magnet.style.visibility != "hidden" }

	/**
	 * 
	 * @param point 
	 * @returns a magnet that is close to the point
	 */
	static getMagnetNearPoint({ x, y }: { x: number, y: number }): HTMLElement {
		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++) {
			if (MagnetManager.isVisible(magnets[i]))
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
	 * reset all magnets (performed when the board is reset)
	 */
	static resetMagnets(): void { document.getElementById("magnets").innerHTML = ""; }

	/**
	 * delete all the magnets, i.e. magnet deletion actions are added in the timeline
	 */
	static clearMagnet(): void {
		/*	MagnetManager.currentMagnet = undefined;
			const magnets = MagnetManager.getMagnets();
	
			while (magnets.length > 0)
				magnets[0].remove();
	
			Share.sendMagnets();*/

		const magnets = MagnetManager.getMagnets();
		for (let i = 0; i < magnets.length; i++) {
			Share.execute("magnetRemove", [magnets[i].id]);
		}

		Menu.hide();
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
		//	document.getElementById("magnets").appendChild(element);

		const f = () => {
			BoardManager.addAction(new ActionMagnetNew(UserManager.me.userID, element));
			if (Share.isShared())
				Share.sendNewMagnet(element);
		}

		/*
		if (element.tagName == "IMG")
			element.addEventListener("load", f);
		else
			f();*/
		f();


		//	MagnetManager._installMagnet(element);
	}

	/**
	 * @returns a new ID for a new magnet
	 */
	public static generateID(): string {
		let id = "";
		do {
			id = "m" + Math.round(Math.random() * 1000000);
		} while (document.getElementById(id) != undefined)
		return id;
	}



	/**
	 * @param {*} userid, id of the user that has created the magnet
	 * @param {*} element
	 * @description add the DOM element element to the list of magnets 
	 * (the only difference with addMagnet is that it does not share the magnet with the other users)
	 */
	static addMagnetFromAnotherUser(userid: string, element: HTMLElement): void {
		if (element.id == "")
			element.id = MagnetManager.generateID();
		MagnetManager.currentMagnet = element;
		element.classList.add("magnet");
		BoardManager.addAction(new ActionMagnetNew(userid, element));
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
		return { x: Math.round(parseInt(m.style.left) + m.clientWidth / 2), y: Math.round(parseInt(m.style.top) + m.clientHeight / 2) };
	}


	static getMagnetMiddleButton(m: HTMLElement): { x: number, y: number } {
		return { x: Math.round(parseInt(m.style.left) + m.clientWidth / 2), y: Math.round(parseInt(m.style.top) + m.clientHeight) };
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
					ConstraintDrawing.freeDraw([line], nodes[i].magnet.id, nodes[j].magnet.id, MagnetManager.getMagnetCenter(nodes[i].magnet), MagnetManager.getMagnetCenter(nodes[j].magnet));
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

		MagnetTextManager.latexTypeSet();
		

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
		copy.onclick = element.onclick;
		return copy;
	}




	/**
	 * 
	 * @param element 
	 * @description remove the focus on the magnet (it is a text magnet for instance)
	 */
	private static magnetUnFocus(element: HTMLElement) {
		console.log("blur")
		element.blur();
		if (element.children.length > 0)
			(<HTMLElement>element.children[0]).blur();
	}



	/**
	 * 
	 * @param magnet 
	 * @returns the set of all magnets that are "contained" in the magnet
	 *  (the contained magnets are the magnets that should move with it etc.)
	 */
	private static getContainedMagnets(element: HTMLElement): HTMLElement[] {
		/**
		 * @param {*} element 
		 * @param {*} bigElement 
		 * @returns true if element is inside bigElement
		 */
		function inside(element: HTMLElement, bigElement: HTMLElement): boolean {
			return element.offsetLeft > bigElement.offsetLeft && element.offsetTop > bigElement.offsetTop &&
				element.offsetLeft + element.clientWidth < bigElement.offsetLeft + bigElement.clientWidth &&
				element.offsetTop + element.clientHeight < bigElement.offsetTop + bigElement.clientHeight;
		}

		const magnets = MagnetManager.getMagnets();
		const otherElementsToMove = [];

		for (let i = 0; i < magnets.length; i++)
			if (magnets[i] != element && inside(magnets[i], element) && MagnetManager.isVisible(magnets[i]))
				otherElementsToMove.push(magnets[i]);

		return otherElementsToMove;
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
				//Share.execute("magnetMove", [copy.id, element.style.left, element.style.top]);
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

			otherElementsToMove = MagnetManager.getContainedMagnets(element);

			Share.execute("magnetMoveStart", [element.id]);

			for (const m of otherElementsToMove)
				Share.execute("magnetMoveStart", [m.id]);

			S.onmagnetmousedown(evt);
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


			const treatPointForMagnet = (magnet) => {
				const x = magnet.offsetLeft - dx;
				const y = magnet.offsetTop - dy;
				Share.execute("magnetMove", [magnet.id, x, y]);
			};
			// set the element's new position:
			treatPointForMagnet(element);

			for (const el of otherElementsToMove)
				treatPointForMagnet(el);

			ConstraintDrawing.update();

			S.onmagnetmove(e);
		}

		function closeDragElement() {
			if (!drag)
				return;

			drag = false;
			//console.log("close drag")

			const storeActionForMagnet = (magnet) => { Share.execute("magnetMoveStop", [magnet.id]); }

			storeActionForMagnet(element);
			for (const el of otherElementsToMove)
				storeActionForMagnet(el);

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
	 * @param element that is a text magnet
	 * @returns the font description
	 */
	static getFont(element: HTMLElement): string {
		return (<HTMLElement>element.children[0]).style.fontSize;
	}


	static getTextColor(element: HTMLElement): string {
		return (<HTMLElement>element.children[0]).style.color;
	}
	/**
	 * 
	 * @param element that is a text magnet
	 * @returns the text in the text magnet
	 */
	static getText(element: HTMLElement): string {
		const content = element.children[0];
		if (content.children.length == 0)
			return content.textContent;
		else
			return Array.from(content.children).map((e) => e.textContent).join('\n');
	}

	/**
	 * 
	 * @param element 
	 * @description adds the event mousedown etc. to the magnet. Call LaTEX
	 */
	static _installMagnet(element: HTMLElement): void {
		if (MagnetTextManager.isTextMagnet(element))
			MagnetTextManager.installMagnetText(element);

		MagnetManager.makeDraggableElement(element);
		MagnetManager.setZIndex(element);

		element.onmouseenter = () => { MagnetManager.magnetUnderCursor = element };
		element.onmouseleave = () => { MagnetManager.magnetUnderCursor = undefined };

	}







	/**
	 * @description remove the current magnet
	 */
	static removeCurrentMagnet(): void {
		if (MagnetManager.currentMagnet == undefined)
			return;
		if (!MagnetManager.currentMagnet.classList.contains("magnet"))
			ShowMessage.error("oups, important bug. The application wanted to delete something else than a magnet!");

		Share.execute("magnetRemove", [MagnetManager.currentMagnet.id]);
	}

	/**
	 *
	 * @param {*} id
	 * @description remove the magnet of id
	 */
	static magnetRemove(id: string): void {
		console.log(`magnetRemove ${id}`);
		BoardManager.addAction(new ActionMagnetDelete(UserManager.me.userID, id));
		//		document.getElementById(id).remove(); //do not remove here because ActionMagnetDelete is doing the job in add Action
		//		document.getElementById(id).style.top = "-1000";
		MagnetManager.currentMagnet == undefined;
		MagnetManager.magnetUnderCursor = undefined;
		ConstraintDrawing.update();
	}


	/**
	 * @param magnet
	 * @description draw the current magnet to the canvas
	 */
	static printMagnet(magnet: HTMLElement): void {

		//decision taken in issue #191: only image magnets are printable
		if (!(magnet instanceof HTMLImageElement))
			return;

		Sound.play("magnetprint");

		const magnetsOnTop = MagnetManager.getContainedMagnets(magnet);

		const doPrintMagnet = (m: HTMLElement) => {
			const action = new ActionPrintMagnet(UserManager.me.userID, m,
				parseInt(m.style.left), parseInt(m.style.top));
			action.redo();
			BoardManager.addAction(action);
		};

		doPrintMagnet(magnet);
		magnetsOnTop.map(doPrintMagnet);
	}

}




window['MagnetManager'] = MagnetManager;