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
	let lastDelineation = new Delineation();

	LoadSave.init();
	BoardManager.init();
	Menu.init();


	let changeColor = () => {
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

	let previousColor = () => {
		if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
			eraseMode = false;

			if (!isDrawing)
				palette.show({ x: x, y: y });
			palette.previous();
		}
		else { // if there is a magnet change the background of the magnet
			let magnet = MagnetManager.getMagnetUnderCursor();
			magnet.style.backgroundColor = previousBackgroundColor(magnet.style.backgroundColor);
		}
	}

	let switchChalkEraser = () => {
		eraseMode = !eraseMode;
		if (eraseMode) {
			palette.hide();
			document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor();
			buttonEraser.innerHTML = "Chalk";
		}
		else {
			document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());
			buttonEraser.innerHTML = "Eraser";
		}
	}


	buttonMenu.onclick = Menu.toggle;
	buttonColors.onclick = changeColor;
	buttonEraser.onclick = switchChalkEraser;


	/*let params = new URLSearchParams(document.location.search.substring(1));
	if (params.get("controls"))
		controls.hidden = false;*/

	Welcome.init();


	BlackVSWhiteBoard.init();

	palette.onchange = () => {
		eraseMode = false;
		document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());
	}

	document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());

	document.onkeydown = (evt) => {
		//console.log("ctrl: " + evt.ctrlKey + " shift:" + evt.shiftKey + "key: " + evt.key)
		if (evt.key == "Escape" || evt.key == "F1") {//escape => show menu
			if (Welcome.isShown())
				Welcome.hide();
			else if (palette.isShown())
				palette.hide();
			else
				Menu.toggle();
		}

		if (Menu.isShown() || Welcome.isShown())
			return;

		if (!evt.ctrlKey && !evt.shiftKey && evt.key == "c") // c => change color
			changeColor();
		else if (!evt.ctrlKey && evt.shiftKey && evt.key == "C")
			previousColor();
		else if (evt.key == "Enter" && palette.isShown())
			palette.hide();
		else if (evt.key == "ArrowLeft" && palette.isShown())
			palette.previous();
		else if (evt.key == "ArrowRight" && palette.isShown())
			palette.next();
		else if (evt.key == "Enter") {
			MagnetManager.addMagnetText(x, y);
			evt.preventDefault(); //so that it will not add "new line" in the text element
		}
		else if (evt.key == "ArrowLeft") {
			BoardManager.left();
		}
		else if (evt.key == "ArrowRight") {
			BoardManager.right();
		}
		else if (evt.key == "d")  //d = divide screen
			divideScreen();
		else if ((evt.ctrlKey && evt.shiftKey && evt.key == "Z") || (evt.ctrlKey && evt.key == "y")) { //ctrl + shift + z OR Ctrl + Y = redo
			BoardManager.redo();
			evt.preventDefault();
		}
		else if (evt.ctrlKey && evt.key == "z") {// ctrl + z = undo 
			BoardManager.cancel();
			evt.preventDefault();
		}

		else if (evt.key == "e")  //e = switch eraser and chalk
			switchChalkEraser();
		else if (evt.ctrlKey && evt.key == 'x') {//Ctrl + x 
			palette.hide();
			if (lastDelineation.containsPolygonToMagnetize())
				lastDelineation.cutAndMagnetize();
		}
		else if (evt.ctrlKey && evt.key == 'c') {//Ctrl + c
			palette.hide();
			if (lastDelineation.containsPolygonToMagnetize())
				lastDelineation.copyAndMagnetize();
		}
		else if (evt.ctrlKey && evt.key == "v") { //Ctrl + v = print the current magnet
			palette.hide();
			MagnetManager.printCurrentMagnet();
		}
		else if (evt.key == "m") { //m = make new magnets
			palette.hide();
			if (lastDelineation.containsPolygonToMagnetize())
				lastDelineation.cutAndMagnetize();
			else {
				MagnetManager.printCurrentMagnet();
				MagnetManager.removeCurrentMagnet();
			}
		}
		else if (evt.key == "p") { //p = print the current magnet
			palette.hide();
			MagnetManager.printCurrentMagnet();
		}
		else if (evt.key == "Delete" || evt.key == "x") { //supr = delete the current magnet
			palette.hide();
			/*if (lastDelineation.containsPolygonToMagnetize())
				lastDelineation.erase();
			else*/
			MagnetManager.removeCurrentMagnet();
			evt.preventDefault();
		}
		
	};


	document.getElementById("canvas").onpointerdown = mousedown;
	document.getElementById("canvas").onpointermove = mousemove;
	document.getElementById("canvas").onpointerup = mouseup;
	//document.getElementById("canvas").onmousedown = mousedown;

	TouchScreen.addTouchEvents(document.getElementById("canvas"));

	
	function mousedown(evt) {
		MagnetManager.setInteractable(false);

		//unselect the selected element (e.g. a text in edit mode)
		document.activeElement.blur();

		evt.preventDefault();
		//console.log("mousedown")
		x = evt.offsetX;
		y = evt.offsetY;
		xInit = x;
		yInit = y;
		isDrawing = true;
		eraseModeBig = false;


		lastDelineation.reset();
		lastDelineation.addPoint({ x: x, y: y });

		palette.hide();
	}


	document.getElementById("canvas").onpointermove = mousemove;
	document.getElementById("canvas").onmousemove = mousemove;

	function mousemove(evt) {
		//console.log("mousemove")
		evt.preventDefault();
		let evtX = evt.offsetX;
		let evtY = evt.offsetY;

		if (isDrawing && lastDelineation.isDrawing()) {
			palette.hide();
			if (eraseMode) {
				let lineWidth = 10;

				lineWidth = 10 + 30 * evt.pressure;

				if (Math.abs(x - xInit) > window.innerWidth / 4 || Math.abs(y - yInit) > window.innerHeight / 4)
					eraseModeBig = true;

				if (eraseModeBig) {
					lineWidth = 128;
				}

				clearLine(document.getElementById("canvas").getContext("2d"), x, y, evtX, evtY, lineWidth);
			}
			else {
				drawLine(document.getElementById("canvas").getContext("2d"), x, y, evtX, evtY, evt.pressure);
				lastDelineation.addPoint({ x: evtX, y: evtY });

			}
			x = evtX;
			y = evtY;

			if (Math.abs(x - xInit) > 1 || Math.abs(y - yInit) > 1)
				alreadyDrawnSth = true;
		}

		x = evtX;
		y = evtY;
	}


	document.getElementById("canvas").onpointerup = mouseup;
	document.getElementById("canvas").onmouseup = mouseup;

	function mouseup(evt) {
		MagnetManager.setInteractable(true);
		lastDelineation.finish();

		evt.preventDefault();
		//console.log("mouseup")
		if (isDrawing && !eraseMode && !alreadyDrawnSth) {
			drawDot(document.getElementById("canvas").getContext("2d"), x, y);
		}

		if (eraseMode) //restore the eraser to the original size
			document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor();

		alreadyDrawnSth = false;
		isDrawing = false;
		BoardManager.saveCurrentScreen();
	}

	//	document.getElementById("canvas").onmouseleave = function (evt) { isDrawing = false; }

	let magnets = document.getElementsByClassName("magnet");
	for (let i = 0; i < magnets.length; i++) {
		magnets[i].style.top = 0;
		magnets[i].style.left = i * 64 + 2;

	}

	MagnetManager.init();
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
	document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor(lineWidth);
	context.lineWidth = lineWidth;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.lineCap = "round";
	context.stroke();
	context.closePath();
}



function divideScreen() {
	let x = container.scrollLeft + window.innerWidth / 2;
	drawLine(document.getElementById("canvas").getContext("2d"), x, 0, x, window.innerHeight);
	BoardManager.saveCurrentScreen();
}


let magnetColors = ['', 'rgb(255, 128, 0)', 'rgb(0, 128, 0)', 'rgb(192, 0, 0)', 'rgb(0, 0, 255)'];

function nextBackgroundColor(color) {
	for (let i = 0; i < magnetColors.length; i++) {
		if (magnetColors[i] == color) {
			return magnetColors[(i + 1) % magnetColors.length];
		}
	}
	return magnetColors[0];
}


function previousBackgroundColor(color) {
	for (let i = 0; i < magnetColors.length; i++) {
		if (magnetColors[i] == color) {
			return magnetColors[(i - 1) % magnetColors.length];
		}
	}
	return magnetColors[0];
}