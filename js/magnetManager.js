

class MagnetManager {

	static magnetX = 0;
	static magnetY = 0;


	static getMagnets() {
		return document.getElementsByClassName("magnet");
	}

	static clearMagnet() {
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
	}
	
	static addMagnetImage(filename) {
		let img = new Image();
		img.src = "magnets/" + filename;
		MagnetManager.addMagnet(img);
		img.onclick = () => {
			console.log("printed");
			let ctx = document.getElementById("canvas").getContext("2d");

			let s = img.style.clipPath;

			s.substr("polygon(".length, s.length - "polygon(".length - ")".length);

			ctx.save();
			ctx.beginPath();
			for(let pointStr in s.split(",")) {
				let a = pointStr.split(" ");
				ctx.moveTo(parseInt(a[0]), parseInt(a[1]));	
			}
			ctx.clip();
		
			ctx.drawImage(img, 0, 0);

			ctx.restore();

			

			BoardManager.save();
		};
	}
	




	static register(magnetSetName) {
		document.getElementById(magnetSetName).onclick = eval(magnetSetName);
	}
	
	
}


