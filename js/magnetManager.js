

class MagnetManager {

	static magnetX = 0;
	static magnetY = 0;
	static currentMagnet = undefined; // last magnet used
	static magnetUnderCursor = undefined;

	static init() {
		document.getElementById("clearMagnet").onclick = MagnetManager.clearMagnet;
		document.getElementById("magnetsArrange").onclick = MagnetManager.arrange;
		document.getElementById("magnetsCreateGraph").onclick = MagnetManager.drawGraph;
	}

	static getMagnetUnderCursor() {
		return MagnetManager.magnetUnderCursor;
	}

	/**
	 * 
	 * @param {boolean} b 
	 * @description if b == true, makes all the magnets interactable with the mouse/pointer
	 *  if b == false, the magnets cannot be moved
	 */
	static setInteractable(b) {
		const v = b ? "auto" : "none";

		let magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++)
			magnets[i].style.pointerEvents = v;

	}

	/**
	 * @returns an array containing all the magnets
	 */
	static getMagnets() {
		return document.getElementsByClassName("magnet");
	}


	/**
	 * delete all the magnets
	 */
	static clearMagnet() {
		MagnetManager.currentMagnet = undefined;
		MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
		MagnetManager.magnetY = 0;
		let magnets = MagnetManager.getMagnets();

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
	static addMagnet(element, callback = () => {}) {
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

		let f = () => {
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


	static arrange() {
		let magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++) {
			let magnet = magnets[i];
			let x = undefined;
			let y = undefined;

			let magnetContains = (m, x, y) => {
				return (parseInt(m.style.left) <= x && parseInt(m.style.top) <= y &&
					x <= parseInt(m.style.left) + parseInt(m.clientWidth) &&
					y <= parseInt(m.style.top) + parseInt(m.clientHeight));
			}

			let dist = () => {
				let minDist = 100000;
				for (let j = 0; j < magnets.length; j++) {
					minDist = Math.min(minDist,
						Math.abs(x - parseInt(magnets[j].style.left)) + Math.abs(y - parseInt(magnets[j].style.top)));
				}
				return minDist;

			}
			let contains = () => {
				for (let j = 0; j < magnets.length; j++) {
					if (magnetContains(magnets[j], x, y) ||
						magnetContains(magnets[j], x + parseInt(magnet.clientWidth), y + parseInt(magnet.clientHeight)))
						return true;
				}
				return false;
			}

			const rect = BoardManager.getCurrentScreenRectangle();

			let generatePosition = () => {
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


	static getNodes() {
		let magnets = MagnetManager.getMagnets();
		let nodes = [];
		for (let i = 0; i < magnets.length; i++) {
			let m = magnets[i];
			nodes.push({ x: parseInt(m.style.left) + parseInt(m.clientWidth) / 2, y: parseInt(m.style.top) + parseInt(m.clientHeight) / 2 });
		}
		console.log(nodes)
		return nodes;
	}

	static drawGraph() {
		MagnetManager.arrange();

		let nodes = MagnetManager.getNodes();
		let context = canvas.getContext("2d");
		let edges = [];
		for (let i = 0; i < nodes.length; i++) {
			edges[i] = [];
			for (let j = 0; j < nodes.length; j++) { edges[i][j] = 0; }
		}

		// returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
		function intersects(a, b, c, d, p, q, r, s) {
			var det, gamma, lambda;
			det = (c - a) * (s - q) - (r - p) * (d - b);
			if (det === 0) {
				return false;
			} else {
				lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
				gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
				return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
			}
		};

		let isCrossing = (i, j) => {
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
					drawLine(context, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
				}
			}

		BoardManager.save();
	}



	static installMagnets() {
		let magnets = MagnetManager.getMagnets();

		for (let i = 0; i < magnets.length; i++)
			MagnetManager._installMagnet(magnets[i]);

	}

	static _installMagnet(element) {
		makeDraggableElement(element);

		

		let f = () => {const LARGENUMBER = 10000; element.style.zIndex = LARGENUMBER - element.clientWidth;};
		if (element.tagName == "IMG") {
			element.addEventListener("load", f);
		}
		else {
			f();
		}

		

		element.onmouseenter = () => { MagnetManager.magnetUnderCursor = element };
		element.onmouseleave = () => { MagnetManager.magnetUnderCursor = undefined };

		function makeDraggableElement(element) {
			var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

			element.addEventListener("pointerdown", dragMouseDown);

			TouchScreen.addTouchEvents(element);

			let otherElementsToMove = [];
			let canvasCursorStore = undefined;
			let drag = true;

			function dragMouseDown(e) {
				drag = true;
				MagnetManager.currentMagnet = e.target;
				/**
				 * 
				 * @param {*} el 
				 * @param {*} bigel 
				 * @returns true if el is inside bigel
				 */
				function inside(el, bigel) {
					return el.offsetLeft > bigel.offsetLeft && el.offsetTop > bigel.offsetTop &&
						el.offsetLeft + el.clientWidth < bigel.offsetLeft + bigel.clientWidth &&
						el.offsetTop + el.clientHeight < bigel.offsetTop + bigel.clientHeight;
				}

				canvasCursorStore = canvas.style.cursor;
				e = e || window.event;
				e.preventDefault(); //to avoid the drag/drop by the browser
				// get the mouse cursor position at startup:

				pos3 = e.clientX * Layout.getZoom();
				pos4 = e.clientY * Layout.getZoom();
				document.onpointerup = closeDragElement;
				document.onmouseup = closeDragElement;
				// call a function whenever the cursor moves:
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

				canvas.style.cursor = "none";
				e = e || window.event;
				e.preventDefault();
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX * Layout.getZoom();
				pos2 = pos4 - e.clientY * Layout.getZoom();
				pos3 = e.clientX * Layout.getZoom();
				pos4 = e.clientY * Layout.getZoom();



				// set the element's new position:
				Share.execute("magnetMove", [element.id, element.offsetLeft - pos1, element.offsetTop - pos2]);

				for (let el of otherElementsToMove) {
					Share.execute("magnetMove", [el.id, el.offsetLeft - pos1, el.offsetTop - pos2]);
				}
			}

			function closeDragElement(e) {
				if (!drag)
					return;

				drag = false;
				console.log("close drag")

				if (e.target.classList != undefined) //it is undefined = dropped outside the screen. TODO: delete the magnets?
					e.target.classList.remove("magnetDrag");

				canvas.style.cursor = canvasCursorStore;

				// stop moving when mouse button is released:
				document.onmouseup = null;
				document.onmousemove = null;
			}
		}
	}




	static addMagnetImage(filename, callback = () => {}) {
		let img = new Image();
		img.src = "magnets/" + filename;
		img.classList.add("backgroundTransparent");
		MagnetManager.addMagnet(img, callback);
		return img;
	}


	static addMagnetText(x, y) {
		let div = document.createElement("div");
		let divText = document.createElement("div");
		MagnetManager.addMagnet(div);
		div.appendChild(divText);
		divText.innerHTML = "type text";
		divText.onpointerdown = (e) => { e.stopPropagation(); }
		divText.onpointermove = (e) => { e.stopPropagation(); }
		divText.onpointerup = (e) => { e.stopPropagation(); }
		divText.onkeydown = (e) => {
			let setFontSize = (size) => {
				divText.style.fontSize = size + "px";
				for (let o of divText.children) {
					o.style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape") {
				divText.blur();
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

		div.style.left = x + "px";
		div.style.top = y + "px";
		div.classList.add("magnetText");
		div.style.backgroundColor = "rgba(0.2, 0.2, 0.2, 0.9)";
		div.style.color = "white";

		divText.contentEditable = true;
		divText.style.fontSize = "24px";
		divText.focus();
		document.execCommand('selectAll', false, null);
	}



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

	static printCurrentMagnet() {
		const img = MagnetManager.currentMagnet;

		if (!(img instanceof Image)) {
			console.log("the current image is not an image! Could not be printed!")
			return;
		}

		let context = document.getElementById("canvas").getContext("2d");

		let x = parseInt(img.style.left);
		let y = parseInt(img.style.top);
		let s = img.style.clipPath;

		s = s.substr("polygon(".length, s.length - "polygon(".length - ")".length);

		context.globalCompositeOperation = "source-over";
		context.save();
		context.beginPath();
		let begin = true;
		for (let pointStr of s.split(",")) {
			pointStr = pointStr.trim();
			let a = pointStr.split(" ");
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


	static register(magnetSetName) {
		document.getElementById(magnetSetName).onclick = eval(magnetSetName);
	}


}


