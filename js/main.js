window.onload = load;
window.onresize = resize;

const BACKGROUND_COLOR = "black";

let palette = new Palette();

function load() {
	let xInit = 0;
	let yInit = 0;

	let x = 0;
	let y = 0;
	let isDrawing = false;
	let alreadyDrawnSth = false; // true if something visible has been drawn (If still false, draw a dot)
	let eraseMode = false;
	let eraseModeBig = false;
	let magnetizer = new MagnetizerMode();


	BoardManager.init();
	palette.createPalette();
	palette.onchange = () => {
		eraseMode = false;
		document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());
	}

	document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());

	document.onkeydown = (evt) => {
		if (evt.keyCode == 27) {//escape => show menu
			if (palette.isShown())
				palette.hide();
			else
				document.getElementById("menu").hidden = !document.getElementById("menu").hidden;
		}

		if (!evt.ctrlKey && evt.key == "c") { // c => change color
			if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
				eraseMode = false;

				if (!isDrawing)
					palette.show({ x: x, y: y });
				palette.next();
			}
			else { // if there is a magnet change the background of the magnet
				let magnet = MagnetManager.getMagnetUnderCursor();
				magnet.style.backgroundColor = nextBackgroundColor(magnet.style.backgroundColor);
			}

		}

		if (evt.key == "d") { //d = divide screen
			divideScreen();
		}

		if (evt.key == "z") {//z = cancel or redo
			if (evt.ctrlKey && evt.shiftKey)
				BoardManager.redo();
			else if (evt.ctrlKey)
				BoardManager.cancel();
		}

		if (evt.keyCode == 69) { //e = switch eraser and chalk
			eraseMode = !eraseMode;
			if (eraseMode) { document.getElementById("canvas").style.cursor = `url('img/eraser.png') 0 0, auto`; }
			else document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());
		}


		if (evt.ctrlKey && evt.key == 'x') {//Ctrl + x 
			if (magnetizer.containsPolygonToMagnetize())
				magnetizer.cutAndMagnetize();

		}


		if (evt.ctrlKey && evt.key == 'c') {//Ctrl + c
			if (magnetizer.containsPolygonToMagnetize())
				magnetizer.copyAndMagnetize();
		}

		if (evt.ctrlKey && evt.key == "v") { //Ctrl + v = print the current magnet
			MagnetManager.printCurrentMagnet();
		}

		if (evt.key == "m") { //m = make new magnets
			if (magnetizer.containsPolygonToMagnetize())
				magnetizer.cutAndMagnetize()();
			else {
				MagnetManager.printCurrentMagnet();
				MagnetManager.removeCurrentMagnet();
			}
		}

		if (evt.key == "p") { //p = print the current magnet
			MagnetManager.printCurrentMagnet();
		}

		if (evt.keyCode == 46) { //supr = delete the current magnet
			MagnetManager.removeCurrentMagnet();
		}
	};


	document.getElementById("canvas").onpointerdown = function (evt) {
		x = evt.offsetX;
		y = evt.offsetY;
		xInit = x;
		yInit = y;
		isDrawing = true;
		eraseModeBig = false;


		magnetizer.reset();
		magnetizer.addPoint({ x: x, y: y });

		palette.hide();
	}


	document.getElementById("canvas").onpointermove = function (evt) {
		let evtX = evt.offsetX;
		let evtY = evt.offsetY;

		if (isDrawing) {
			palette.hide();
			if (eraseMode) {
				let lineWidth = 20;


				lineWidth = 20 + 30 * evt.pressure;

				if (Math.abs(x - xInit) > window.innerWidth / 4 || Math.abs(y - yInit) > window.innerHeight / 4)
					eraseModeBig = true;

				if (eraseModeBig) {
					evtY = evtY + 64; //shift because big erasing, centered
					lineWidth = 300;
				}

				clearLine(document.getElementById("canvas").getContext("2d"), x, y, evtX, evtY, lineWidth);
			}
			else {
				drawLine(document.getElementById("canvas").getContext("2d"), x, y, evtX, evtY, evt.pressure);
				magnetizer.addPoint({ x: evtX, y: evtY });

			}
			x = evtX;
			y = evtY;

			if (Math.abs(x - xInit) > 1 || Math.abs(y - yInit) > 1)
				alreadyDrawnSth = true;
		}

		x = evtX;
		y = evtY;
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

	document.getElementById("clearMagnet").onclick = MagnetManager.clearMagnet;

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
	context.strokeStyle = palette.getCurrentColor();
	context.globalCompositeOperation = "source-over";
	context.globalAlpha = 0.75 + 0.25 * pressure;
	context.lineWidth = 1 + 3.5 * pressure;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
}


function drawDot(context, x, y) {
	context.beginPath();
	context.fillStyle = palette.getCurrentColor();
	context.lineWidth = 2.5;
	context.arc(x, y, 2, 0, 2 * Math.PI);
	context.fill();
	context.closePath();
}


function clearLine(context, x1, y1, x2, y2, lineWidth = 10) {
	context.beginPath();
	//context.strokeStyle = BACKGROUND_COLOR;
	context.globalCompositeOperation = "destination-out";
	context.strokeStyle = "rgba(255,255,255,1)";
	context.lineWidth = lineWidth;
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




function nextBackgroundColor(color) {
	let colors = ['rgb(64, 64, 64)', 'rgb(0, 128, 0)', 'rgba(192, 0, 0)', 'rgb(0, 0, 128)'];

	for (let i = 0; i < colors.length; i++) {
		if (colors[i] == color)
			return colors[(i + 1) % colors.length];
	}

	return colors[0];
}