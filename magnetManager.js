let magnetX = 0;


function clearMagnet() {
	magnetX = 0;
	let magnets = document.getElementsByClassName("magnet");

	while (magnets.length > 0)
		magnets[0].remove();

	document.getElementById("menu").hidden = true;

	setTimeout(setMagnetsZIndex, 400);
}



function setMagnetsZIndex() {
	let magnets = document.getElementsByClassName("magnet");

	let A = [...Array(magnets.length).keys()];

	A.sort((i, j) => magnets[j].clientWidth - magnets[i].clientWidth);
	//A contains the indices of the magnet from the biggest to the smallest

	for (let i = 0; i < magnets.length; i++) {
		magnets[A[i]].style.zIndex = i;
	}
}

function addMagnet(element) {
	element.style.top = "0px";
	element.style.left = magnetX + "px";
	magnetX += 64;
	element.classList.add("magnet");
	document.body.appendChild(element);
	dragElement(element);
}

function addMagnetImage(filename) {
	img = new Image();
	img.src = "magnets/" + filename;
	addMagnet(img);
}


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

		let magnets = document.getElementsByClassName("magnet");
		otherElementsToMove = [];
		for (let i = 0; i < magnets.length; i++)
			if (magnets[i] != elmnt && inside(magnets[i], elmnt)) {
				otherElementsToMove.push(magnets[i]);
			}
	}

	function elementDrag(e) {



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