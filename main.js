window.onload = load;
window.onresize = resize;

const BACKGROUND_COLOR = "black";

const colors = ["white", "orange", "rgb(100, 172, 255)"];

let currentColorID = 0;

function load() {
	let xInit = 0;
	let yInit = 0;

	let x = 0;
	let y = 0;
	let isDrawing = false;
	let alreadyDrawnSth = false; // true if something visible has been drawn (If still false, draw a dot)
	let eraseMode = false;

	BoardManager.init();

	document.onkeydown = (evt) => {
		if (evt.keyCode == 27) {//escape => show menu
			document.getElementById("menu").hidden = !document.getElementById("menu").hidden;
		}


		if (evt.keyCode == 67) { //c => change color
			currentColorID++;
			currentColorID = currentColorID % colors.length;
			document.getElementById("canvas").style.cursor = `url('chalk${currentColorID}.png') 0 0, auto`;
		}

		if (evt.keyCode == 68) {
			divideScreen();
		}

		if (evt.keyCode == 69) { //e = switch eraser and chalk
			eraseMode = !eraseMode;
			if (eraseMode) { document.getElementById("canvas").style.cursor = `url('eraser.png') 0 0, auto`; }
			else document.getElementById("canvas").style.cursor = `url('chalk${currentColorID}.png') 0 0, auto`;
		}
	};


	document.getElementById("canvas").onpointerdown = function (evt) {
		x = evt.offsetX;
		y = evt.offsetY;
		xInit = x;
		yInit = y;
		isDrawing = true;
	}


	document.getElementById("canvas").onpointermove = function (evt) {
		let evtX = evt.offsetX;
		let evtY = evt.offsetY;
		if (isDrawing) {
			if (eraseMode) {
				if (evt.pressure >= 0.5) {
					evtY = evtY + 64; //shift because big erasing, centered
				}
				clearLine(document.getElementById("canvas").getContext("2d"), x, y, evtX, evtY, evt.pressure);
			}
			else {
				drawLine(document.getElementById("canvas").getContext("2d"), x, y, evtX, evtY, evt.pressure);

			}
			x = evtX;
			y = evtY;

			if (Math.abs(x - xInit) > 1 || Math.abs(y - yInit) > 1)
				alreadyDrawnSth = true;
		}
	}


	document.getElementById("canvas").onpointerup = function (evt) {
		if (isDrawing && !eraseMode && !alreadyDrawnSth) {
			drawDot(document.getElementById("canvas").getContext("2d"), x, y);
		}
		alreadyDrawnSth = false;
		isDrawing = false;
		BoardManager.save();
	}

	document.getElementById("canvas").onmouseleave = function (evt) { isDrawing = false; }

	let magnets = document.getElementsByClassName("magnet");
	for (let i = 0; i < magnets.length; i++) {
		magnets[i].style.top = 0;
		magnets[i].style.left = i * 64 + 2;

	}

	document.getElementById("clearMagnet").onclick = clearMagnet;

	setTimeout(() => document.getElementById("help").hidden = true, 5000)
	loadMagnets();

	BoardManager.load();
	resize();


}


function resize() {
	BoardManager.resize(window.innerWidth, window.innerHeight);
}


function drawLine(context, x1, y1, x2, y2, pressure = 1.0) {
	context.beginPath();
	context.strokeStyle = colors[currentColorID];
	context.globalAlpha = 0.75 + 0.25 * pressure;
	context.lineWidth = 1 + 3.5 * pressure;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
}


function drawDot(context, x, y) {
	context.beginPath();
	context.fillStyle = colors[currentColorID];
	context.lineWidth = 2.5;
	context.arc(x, y, 2, 0, 2 * Math.PI);
	context.fill();
	context.closePath();
}


function clearLine(context, x1, y1, x2, y2, pressure = 1.0) {
	context.beginPath();
	context.strokeStyle = BACKGROUND_COLOR;
	if (pressure < 0.5)
		context.lineWidth = 20 + 30 * pressure;
	else
		context.lineWidth = 300;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
}



function divideScreen() {
	let x = document.body.scrollLeft + window.innerWidth / 2;
	drawLine(document.getElementById("canvas").getContext("2d"), x, 0, x, window.innerHeight);
	BoardManager.save();
}