

class MagnetManager {

	static magnetX = 0;
	static magnetY = 0;
	static currentMagnet = undefined; // last magnet used
	static magnetUnderCursor = undefined;


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
		MagnetManager.magnetX = 0;
		MagnetManager.magnetY = 0;
		let magnets = MagnetManager.getMagnets();

		while (magnets.length > 0)
			magnets[0].remove();

		Menu.hide();
	}

/**
 * 
 * @param {*} element 
 * @description add the DOM element element to the list of magnets
 */
	static addMagnet(element) {
		if (MagnetManager.magnetX > window.innerWidth - 10) {
			MagnetManager.magnetX = 0;
			MagnetManager.magnetY += 64;
		}

		element.style.left = MagnetManager.magnetX + "px";
		element.style.top = MagnetManager.magnetY + "px";

		//done with setTimeout because images may be loaded
		setTimeout(() => element.style.zIndex = window.innerWidth - element.clientWidth, 400);

		MagnetManager.magnetX += 64;
		MagnetManager.currentMagnet = element;
		element.classList.add("magnet");

		document.getElementById("magnets").appendChild(element);
		MagnetManager._installMagnet(element);
	}


	static _installMagnet(element) {
		makeDraggableElement(element);


		element.onmouseenter = () => { MagnetManager.magnetUnderCursor = element };
		element.onmouseleave = () => { MagnetManager.magnetUnderCursor = undefined };
		function makeDraggableElement(element) {
			var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
			if (document.getElementById(element.id + "header")) {
				// if present, the header is where you move the DIV from:
				document.getElementById(element.id + "header").onmousedown = dragMouseDown;
			} else {
				// otherwise, move the DIV from anywhere inside the DIV:
				element.onmousedown = dragMouseDown;
			}

			let otherElementsToMove = [];
			let canvasCursorStore = undefined;
			
			function dragMouseDown(e) {

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
				e.preventDefault();
				// get the mouse cursor position at startup:
				pos3 = e.clientX;
				pos4 = e.clientY;
				document.onmouseup = closeDragElement;
				// call a function whenever the cursor moves:
				document.onmousemove = elementDrag;

				let magnets = MagnetManager.getMagnets();
				otherElementsToMove = [];

				//if(elmt.style.clipPath == undefined) //if not an image (otherwise bug)
				for (let i = 0; i < magnets.length; i++)
					if (magnets[i] != element && inside(magnets[i], element)) {
						otherElementsToMove.push(magnets[i]);
					}
			}


			

			function elementDrag(e) {
				MagnetManager.currentMagnet = e.target;
				e.target.classList.add("magnetDrag");
				
				canvas.style.cursor = "none";
				e = e || window.event;
				e.preventDefault();
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;



				// set the element's new position:
				element.style.top = (element.offsetTop - pos2) + "px";
				element.style.left = (element.offsetLeft - pos1) + "px";

				for (let el of otherElementsToMove) {
					el.style.top = (el.offsetTop - pos2) + "px";
					el.style.left = (el.offsetLeft - pos1) + "px";
				}
			}

			function closeDragElement(e) {
				
				e.target.classList.remove("magnetDrag");
				canvas.style.cursor = canvasCursorStore;
				
				// stop moving when mouse button is released:
				document.onmouseup = null;
				document.onmousemove = null;
			}
		}
	}




	static addMagnetImage(filename) {
		let img = new Image();
		img.src = "magnets/" + filename;
		MagnetManager.addMagnet(img);
	}



	static removeCurrentMagnet() {
		MagnetManager.currentMagnet.remove();
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


