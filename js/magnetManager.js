

class MagnetManager {

	static magnetX = 0;
	static magnetY = 0;
	static currentMagnet = undefined;

	static getMagnets() {
		return document.getElementsByClassName("magnet");
	}

	static clearMagnet() {
		MagnetManager.currentMagnet = undefined;
		MagnetManager.magnetX = 0;
		MagnetManager.magnetY = 0;
		let magnets = MagnetManager.getMagnets();

		while (magnets.length > 0)
			magnets[0].remove();

		document.getElementById("menu").hidden = true;

		setTimeout(MagnetManager.setMagnetsZIndex, 400);
	}



	static setMagnetsZIndex() {
		let magnets = MagnetManager.getMagnets();

		let A = [...Array(magnets.length).keys()];

		A.sort((i, j) => magnets[j].clientWidth - magnets[i].clientWidth);
		//A contains the indices of the magnet from the biggest to the smallest

		for (let i = 0; i < magnets.length; i++) {
			magnets[A[i]].style.zIndex = i;
		}
	}

	static addMagnet(element) {
		if (MagnetManager.magnetX > window.innerWidth - 10) {
			MagnetManager.magnetX = 0;
			MagnetManager.magnetY += 64;
		}

		element.style.left = MagnetManager.magnetX + "px";
		element.style.top = MagnetManager.magnetY + "px";

		MagnetManager.magnetX += 64;
		MagnetManager.currentMagnet = element;
		element.classList.add("magnet");
		document.body.appendChild(element);
		dragElement(element);

		function dragElement(elmnt) {
			var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
			if (document.getElementById(elmnt.id + "header")) {
				// if present, the header is where you move the DIV from:
				document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
			} else {
				// otherwise, move the DIV from anywhere inside the DIV:
				elmnt.onmousedown = dragMouseDown;
			}

			let otherElementsToMove = [];
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
					if (magnets[i] != elmnt && inside(magnets[i], elmnt)) {
						otherElementsToMove.push(magnets[i]);
					}
			}

			function elementDrag(e) {
				MagnetManager.currentMagnet = e.target;

				e = e || window.event;
				e.preventDefault();
				// calculate the new cursor position:
				pos1 = pos3 - e.clientX;
				pos2 = pos4 - e.clientY;
				pos3 = e.clientX;
				pos4 = e.clientY;



				// set the element's new position:
				elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
				elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";

				for (let el of otherElementsToMove) {
					el.style.top = (el.offsetTop - pos2) + "px";
					el.style.left = (el.offsetLeft - pos1) + "px";
				}
			}

			function closeDragElement() {
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


