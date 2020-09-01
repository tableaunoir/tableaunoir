window.onload = load;
window.onresize = load;

function load() {
	let x = 0;
	let y = 0;
	let isDrawing = false;
	console.log("loading")
	document.getElementById("canvas").width = window.innerWidth;
	document.getElementById("canvas").height = window.innerHeight;

	document.onkeydown = (evt) => {
		if (evt.ctrlKey) { document.getElementById("canvas").classList.add("eraser") }
		else  document.getElementById("canvas").classList.remove("eraser")
	};

	document.onkeyup = (evt) => {
		if (evt.ctrlKey) { document.getElementById("canvas").classList.add("eraser") }
		else  document.getElementById("canvas").classList.remove("eraser")
	};


	document.getElementById("canvas").onmousedown = function (evt) {
		x = evt.offsetX;
		y = evt.offsetY;
		isDrawing = true;
	}


	document.getElementById("canvas").onmousemove = function (evt) {
		if (isDrawing) {
			if (evt.ctrlKey)
				clearLine(document.getElementById("canvas").getContext("2d"), x, y, evt.offsetX, evt.offsetY);
			else
				drawLine(document.getElementById("canvas").getContext("2d"), x, y, evt.offsetX, evt.offsetY);
			x = evt.offsetX;
			y = evt.offsetY;
		}
	}


	document.getElementById("canvas").onmouseup = function (evt) {
		/*if (isDrawing === true) {
			drawLine(document.getElementById("canvas").getContext("2d"), x, y, evt.offsetX, evt.offsetY);
			x = 0;
			y = 0;
			isDrawing = false;
		  }*/
		isDrawing = false;
	}

	document.getElementById("canvas").onmouseleave = function (evt) {
		/*if (isDrawing === true) {
			drawLine(document.getElementById("canvas").getContext("2d"), x, y, evt.offsetX, evt.offsetY);
			x = 0;
			y = 0;
			isDrawing = false;
		  }*/
		isDrawing = false;
	}

	let magnets = document.getElementsByClassName("magnet");
	for(let i = 0; i < magnets.length; i++) {
		magnets[i].style.top = 0;
		magnets[i].style.left = i*64;
		dragElement(magnets[i]);
	}
		
}




function drawLine(context, x1, y1, x2, y2) {
	context.beginPath();
	context.strokeStyle = 'white';
	context.lineWidth = 1.5;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
}


function clearLine(context, x1, y1, x2, y2) {
	context.beginPath();
	context.strokeStyle = 'black';
	context.lineWidth = 20;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
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

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
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
  }

  function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
  }
}