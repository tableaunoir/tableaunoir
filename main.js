window.onload = load;
window.onresize = resize;

function load() {
	let x = 0;
	let y = 0;
	let isDrawing = false;
	let eraseMode = false;

	document.onkeydown = (evt) => {
		if (evt.keyCode == 27) {//escape 
			document.getElementById("menu").hidden = !document.getElementById("menu").hidden;
		}

		if (evt.keyCode == 69) { //e
			eraseMode = !eraseMode;
			if (eraseMode) { document.getElementById("canvas").classList.add("eraser") }
			else document.getElementById("canvas").classList.remove("eraser")
		}
	};


	document.getElementById("canvas").onmousedown = function (evt) {
		x = evt.offsetX;
		y = evt.offsetY;
		isDrawing = true;
	}


	document.getElementById("canvas").onmousemove = function (evt) {
		if (isDrawing) {
			if (eraseMode)
				clearLine(document.getElementById("canvas").getContext("2d"), x, y, evt.offsetX, evt.offsetY);
			else
				drawLine(document.getElementById("canvas").getContext("2d"), x, y, evt.offsetX, evt.offsetY);
			x = evt.offsetX;
			y = evt.offsetY;
		}
	}


	document.getElementById("canvas").onmouseup = function (evt) { isDrawing = false; }

	document.getElementById("canvas").onmouseleave = function (evt) { isDrawing = false; }

	let magnets = document.getElementsByClassName("magnet");
	for (let i = 0; i < magnets.length; i++) {
		magnets[i].style.top = 0;
		magnets[i].style.left = i * 64 + 2;

	}

	document.getElementById("clearMagnet").onclick = clearMagnet;

	setTimeout(() => document.getElementById("help").hidden = true, 5000)
	loadMagnets();

	resize();
}


function resize() {
	let w = document.getElementById("canvas").width;
	if (document.getElementById("canvas").width < window.innerWidth)
		document.getElementById("canvas").width = window.innerWidth;

	if (document.getElementById("canvas").height < window.innerHeight)
		document.getElementById("canvas").height = window.innerHeight;
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

