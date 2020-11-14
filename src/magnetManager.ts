import { getCanvas } from "./main";
import { Share } from "./share";
import { BoardManager } from './boardManager';
import { Layout } from './Layout';
import { Menu } from './Menu';
import { TouchScreen } from './TouchScreen';
import { Drawing } from './Drawing';

export class MagnetManager {

	static magnetX = 0;
	static magnetY = 64;
	static currentMagnet = undefined; // last magnet used
	static magnetUnderCursor = undefined;



	/**
	 * initialization
	 */
	static init() {
		document.getElementById("clearMagnet").onclick = MagnetManager.clearMagnet;
		document.getElementById("magnetsArrange").onclick = MagnetManager.arrange;
		document.getElementById("magnetsCreateGraph").onclick = MagnetManager.drawGraph;
	}


	/**
	 * @returns the magnet under the cursor
	 */
	static getMagnetUnderCursor() {
		return MagnetManager.magnetUnderCursor;
	}


	/**
	 * @returns true iff there is a current magnet
	 */
	static hasCurrentMagnet() {
		return MagnetManager.currentMagnet == undefined;
	}


	/**
	 * @description set that there is no current magnet
	 */
	static noCurrentMagnet() {
		MagnetManager.currentMagnet = undefined;
	}


	/**
	 * @returns the ID of the current magnet
	 */
	static getCurrentMagnetID(): string {
		return MagnetManager.currentMagnet.id;
	}



	/**
	 *
	 * @param {boolean} b
	 * @description if b == true, makes all the magnets interactable with the mouse/pointer
	 *  if b == false, the magnets cannot be moved
	 */
	static setInteractable(b) {
		const v = b ? "auto" : "none";

		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++)
			(<any>magnets[i]).style.pointerEvents = v;

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
	static getYTopWhenNewMagnets() {
		return 64;
	}

	/**
	 * delete all the magnets
	 */
	static clearMagnet() {
		MagnetManager.currentMagnet = undefined;
		MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
		MagnetManager.magnetY = MagnetManager.getYTopWhenNewMagnets();
		const magnets = MagnetManager.getMagnets();

		while (magnets.length > 0)
			magnets[0].remove();

		Share.sendMagnets();

		Menu.hide();
	}

	/**
	 *
	 * @param {*} element
	 * @description add the DOM element element to the list of magnets
	 */
	static addMagnet(element, callback = (el) => { }) {
		if (MagnetManager.magnetX > BoardManager.getCurrentScreenRectangle().x2 - 10) {
			MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
			MagnetManager.magnetY += 64;
		}

		element.id = "m" + Math.random(); //generate randomly an id
		element.style.left = MagnetManager.magnetX + "px";
		element.style.top = MagnetManager.magnetY + "px";

		MagnetManager.magnetX += 64;
		MagnetManager.currentMagnet = element;
		element.classList.add("magnet");
		document.getElementById("magnets").appendChild(element);

		const f = () => {
			if (Share.isShared())
				Share.sendNewMagnet(element);
			callback(element);
		}


		if (element.tagName == "IMG") {
			element.addEventListener("load", f);
		}
		else {
			f();
		}

		MagnetManager._installMagnet(element);
	}

	/**
	 * @description put the existing magnets on the current screen
	 */
	static arrange() {
		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++) {
			const magnet = magnets[i];
			let x = undefined;
			let y = undefined;

			const magnetContains = (m, x, y) => {
				return (parseInt(m.style.left) <= x && parseInt(m.style.top) <= y &&
					x <= parseInt(m.style.left) + parseInt(m.clientWidth) &&
					y <= parseInt(m.style.top) + parseInt(m.clientHeight));
			}

			const dist = () => {
				let minDist = 100000;
				for (let j = 0; j < magnets.length; j++) {
					minDist = Math.min(minDist,
						Math.abs(x - parseInt((<any>magnets[j]).style.left)) + Math.abs(y - parseInt((<any>magnets[j]).style.top)));
				}
				return minDist;

			}
			const contains = () => {
				for (let j = 0; j < magnets.length; j++) {
					if (magnetContains(magnets[j], x, y) ||
						magnetContains(magnets[j], x + magnet.clientWidth, y + magnet.clientHeight))
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

	/**
	 * @returns the array of center points of existing magnets
	 */
	static getNodes() {
		const magnets = MagnetManager.getMagnets();
		const nodes = [];
		for (let i = 0; i < magnets.length; i++) {
			const m = magnets[i];
			nodes.push({ x: parseInt(m.style.left) + m.clientWidth / 2, y: parseInt(m.style.top) + m.clientHeight / 2 });
		}
		console.log(nodes)
		return nodes;
	}

	/**
	 * @description make a graph where the nodes are the magnets
	 */
	static drawGraph() {
		MagnetManager.arrange();

		const nodes = MagnetManager.getNodes();
		const canvas = getCanvas();
		const context = canvas.getContext("2d");
		const edges = [];
		for (let i = 0; i < nodes.length; i++) {
			edges[i] = [];
			for (let j = 0; j < nodes.length; j++) { edges[i][j] = 0; }
		}

		// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
		function intersects(a, b, c, d, p, q, r, s) {
			let det, gamma, lambda;
			det = (c - a) * (s - q) - (r - p) * (d - b);
			if (det === 0) {
				return false;
			} else {
				lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
				gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
				return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
			}
		}

		const isCrossing = (i, j) => {
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
					Drawing.drawLine(context, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
				}
			}

		BoardManager.save();
	}


	/**
	 * @description adds the event mousedown etc. to the magnets. Call LaTEX
	 */
	static installMagnets() {
		const magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++)
			MagnetManager._installMagnet(magnets[i]);

		eval("MathJax.typeset();");

	}




	/**
	 * @param element 
	 * @description set the z-index of the element depending on the size of the element
	 */
	static setZIndex(element) {
		let f = () => { const LARGENUMBER = 10000; element.style.zIndex = LARGENUMBER - element.clientWidth; };

		if (element.tagName == "IMG") {
			element.addEventListener("load", f);
		}
		else {
			f();
		}
	}



	/**
	 * 
	 * @param element 
	 * @returns a copy of the element, ready to be given to addMagnet
	 */
	private static createCopyMagnet(element: HTMLElement): HTMLElement {
		return <HTMLElement>element.cloneNode(true);
	}


	/**
	 * 
	 * @param element 
	 * @description makes that the magnet is draggable
	 */
	private static makeDraggableElement(element) {
		let dx = 0, dy = 0, x = 0, y = 0;

		element.addEventListener("pointerdown", dragMouseDown);

		TouchScreen.addTouchEvents(element);

		let otherElementsToMove = [];
		let canvasCursorStore = undefined;
		let drag = true;


		function dragMouseDown(evt) {
			drag = true;
			MagnetManager.currentMagnet = evt.target;

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

			document.onpointerup = closeDragElement;
			document.onmouseup = closeDragElement;
			document.onpointermove = elementDrag;

			let magnets = MagnetManager.getMagnets();
			otherElementsToMove = [];

			//if(elmt.style.clipPath == undefined) //if not an image (otherwise bug)
			for (let i = 0; i < magnets.length; i++)
				if (magnets[i] != element && inside(magnets[i], element)) {
					otherElementsToMove.push(magnets[i]);
				}


		}



		function elementDrag(e) {
			if (!drag) return;

			MagnetManager.currentMagnet = e.target;
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

			for (let el of otherElementsToMove) {
				Share.execute("magnetMove", [el.id, el.offsetLeft - dx, el.offsetTop - dy]);
			}
		}

		function closeDragElement(e) {
			if (!drag)
				return;

			drag = false;
			console.log("close drag")

			if (e.target.classList != undefined) //it is undefined = dropped outside the screen. TODO: delete the magnets?
				e.target.classList.remove("magnetDrag");

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
	static _installMagnet(element) {
		if (element.classList.contains("magnetText"))
			MagnetManager.installMagnetText(element);

		MagnetManager.makeDraggableElement(element);
		MagnetManager.setZIndex(element);

		element.onmouseenter = () => { MagnetManager.magnetUnderCursor = element };
		element.onmouseleave = () => { MagnetManager.magnetUnderCursor = undefined };

	}



	/**
	 *
	 * @param filename
	 * @param callback
	 * @description adds a image magnet where the file is already on the server
	 */
	static addMagnetImage(filename, callback = (el) => { }) {
		const img = new Image();
		img.src = "img/magnets/" + filename;
		img.classList.add("backgroundTransparent");
		MagnetManager.addMagnet(img, callback);
		return img;
	}


	/**
	 *
	 * @param element
	 * @description set up the text magnet: add the mouse event, key event for editing the text magnet
	 */
	static installMagnetText(element) {

		const divText = element.children[0];

		divText.onpointerdown = (e) => { e.stopPropagation(); }
		divText.onpointermove = (e) => { e.stopPropagation(); }
		divText.onpointerup = (e) => { e.stopPropagation(); }
		divText.onkeydown = (e) => {
			const setFontSize = (size) => {
				divText.style.fontSize = size + "px";
				for (const o of divText.children) {
					o.style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape") {
				divText.blur();
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
	static addMagnetText(x, y) {
		const div = document.createElement("div");
		const divText = document.createElement("div");

		div.appendChild(divText);
		divText.innerHTML = "type text";
		divText.contentEditable = "true";
		divText.style.fontSize = "24px";
		div.classList.add("magnetText");


		MagnetManager.addMagnet(div);
		div.style.left = x + "px";
		div.style.top = y + "px";
		divText.focus();

		if (Share.isShared())
			Share.sendMagnetChanged(div);


		document.execCommand('selectAll', false, null);
	}


	/**
	 * @description remove the current magnet
	 */
	static removeCurrentMagnet() {
		if (MagnetManager.currentMagnet == undefined)
			return;
		Share.execute("magnetRemove", [MagnetManager.currentMagnet.id]);
	}

	/**
	 *
	 * @param {*} id
	 * @description remove the magnet of id
	 */
	static magnetRemove(id) {
		document.getElementById(id).remove();
		MagnetManager.currentMagnet == undefined;
		MagnetManager.magnetUnderCursor = undefined;
	}


	/**
	 * @param img
	 * @description draw the current magnet to the canvas
	 */
	static printMagnet(img) {

		if (!(img instanceof Image)) {
			console.log("the current image is not an image! Could not be printed!")
			return;
		}

		const context = getCanvas().getContext("2d");

		const x = parseInt(img.style.left);
		const y = parseInt(img.style.top);
		let s = img.style.clipPath;

		s = s.substr("polygon(".length, s.length - "polygon(".length - ")".length);

		context.globalCompositeOperation = "source-over";
		context.save();
		context.beginPath();
		let begin = true;
		for (let pointStr of s.split(",")) {
			pointStr = pointStr.trim();
			const a = pointStr.split(" ");
			if (begin)
				context.moveTo(x + parseInt(a[0]), y + parseInt(a[1]));
			else
				context.lineTo(x + parseInt(a[0]), y + parseInt(a[1]));
			begin = false;
		}
		context.closePath();
		context.clip();

		context.drawImage(img, x, y);

		context.restore();



		BoardManager.save();
	}




}
