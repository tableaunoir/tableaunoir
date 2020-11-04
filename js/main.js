window.onload = load;


let palette = new Palette();
let loaded = false;

function load() {
	try {
		if (loaded)
			return;

		setTimeout(load, 1000); //trick for ipad ?

		UserManager.init();

		buttonNoBackground.onclick = () => { backgroundClear(); Menu.hide(); };
		buttonMusicScore.onclick = () => { musicScore(); Menu.hide(); };

		Layout.init();

		ChalkCursor.init();
		LoadSave.init();
		BoardManager.init();
		Menu.init();
		Share.init();
		Toolbar.init();



		let changeColor = () => {
			if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
				//if (!isDrawing)
				palette.show({ x: UserManager.me.x, y: UserManager.me.y });
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
			if (UserManager.me.eraseMode)
				Share.execute("switchChalk", [UserManager.me.userID]);
			else
				Share.execute("switchErase", [UserManager.me.userID]);


		}


		buttonMenu.onclick = Menu.toggle;
		buttonColors.onclick = changeColor;
		buttonEraser.onclick = switchChalkEraser;
		buttonText.onclick = () => MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
		buttonDivide.onclick = divideScreen;

		buttonLeft.onclick = BoardManager.left;
		buttonRight.onclick = BoardManager.right;
		buttonCancel.onclick = BoardManager.cancel;
		buttonRedo.onclick = BoardManager.redo;

		let buttons = document.getElementById("controls").children;

		for (let i = 0; i < buttons.length; i++)
			buttons[i].onfocus = document.activeElement.blur;

		Welcome.init();


		BlackVSWhiteBoard.init();

		palette.onchange = () => {
			Share.execute("switchChalk", [UserManager.me.userID]);
			Share.execute("setCurrentColor", [UserManager.me.userID, palette.getCurrentColor()]);
		}


		document.onkeydown = (evt) => {
			//console.log("ctrl: " + evt.ctrlKey + " shift:" + evt.shiftKey + "key: " + evt.key)
			if (evt.key == "Backspace")
				evt.preventDefault();

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
				MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
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
			else if (evt.key == "h")
				Toolbar.toggle();
			else if (evt.ctrlKey && evt.key == 'x') {//Ctrl + x 
				palette.hide();
				if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
					UserManager.me.lastDelineation.cutAndMagnetize();
			}
			else if (evt.ctrlKey && evt.key == 'c') {//Ctrl + c
				palette.hide();
				if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
					UserManager.me.lastDelineation.copyAndMagnetize();
			}
			else if (evt.ctrlKey && evt.key == "v") { //Ctrl + v = print the current magnet
				palette.hide();
				MagnetManager.printCurrentMagnet();
			}
			else if (evt.key == "m") { //m = make new magnets
				palette.hide();
				if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
					UserManager.me.lastDelineation.cutAndMagnetize();
				else {
					MagnetManager.printCurrentMagnet();
					MagnetManager.removeCurrentMagnet();
				}
			}
			else if (evt.key == "p") { //p = print the current magnet
				palette.hide();
				MagnetManager.printCurrentMagnet();
			}
			else if (evt.key == "Delete" || evt.key == "x" || evt.key == "Backspace") { //supr = delete the current magnet
				palette.hide();
				/*if (lastDelineation.containsPolygonToMagnetize())
					lastDelineation.erase();
				else*/
				MagnetManager.removeCurrentMagnet();
				evt.preventDefault();
			}

		};


		document.getElementById("canvas").onpointerdown = (evt) => {
			if (Welcome.isShown())
				Welcome.hide();
			evt.preventDefault();
			Share.execute("mousedown", [UserManager.me.userID, evt])
		};
		document.getElementById("canvasBackground").onpointermove = (evt) => { console.log("mousemove on the background should not occur") };
		document.getElementById("canvas").onpointermove = (evt) => { evt.preventDefault(); Share.execute("mousemove", [UserManager.me.userID, evt]) };
		document.getElementById("canvas").onpointerup = (evt) => { evt.preventDefault(); Share.execute("mouseup", [UserManager.me.userID, evt]) };
		//document.getElementById("canvas").onmousedown = mousedown;

		TouchScreen.addTouchEvents(document.getElementById("canvas"));




		//	document.getElementById("canvas").onmouseleave = function (evt) { isDrawing = false; }

		let magnets = document.getElementsByClassName("magnet");
		for (let i = 0; i < magnets.length; i++) {
			magnets[i].style.top = 0;
			magnets[i].style.left = i * 64 + 2;

		}

		MagnetManager.init();
		loadMagnets();

		BoardManager.load();
		loaded = true;
	}
	catch (e) {
		ErrorMessage.show(e);
		loaded = false;
	}
}





function drawLine(context, x1, y1, x2, y2, pressure = 1.0, color = UserManager.me.getCurrentColor()) {
	//console.log(pressure)
	context.beginPath();
	context.strokeStyle = color;
	context.globalCompositeOperation = "source-over";
	context.globalAlpha = 0.75 + 0.25 * pressure;
	context.lineWidth = 1 + 3.5 * pressure;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.stroke();
	context.closePath();
}


function drawDot(x, y, color) {
	const context = document.getElementById("canvas").getContext("2d");
	context.beginPath();
	context.fillStyle = color;
	context.lineWidth = 2.5;
	context.arc(x, y, 2, 0, 2 * Math.PI);
	context.fill();
	context.closePath();
}


function clearLine(x1, y1, x2, y2, lineWidth = 10) {
	const context = document.getElementById("canvas").getContext("2d");
	context.beginPath();
	//context.strokeStyle = BACKGROUND_COLOR;
	context.globalCompositeOperation = "destination-out";
	context.strokeStyle = "rgba(255,255,255,1)";

	context.lineWidth = lineWidth;
	context.moveTo(x1, y1);
	context.lineTo(x2, y2);
	context.lineCap = "round";
	context.stroke();
	context.closePath();
}



function divideScreen() {
	console.log("divide the screen")
	let x = container.scrollLeft + Layout.getWindowWidth() / 2;
	drawLine(canvas.getContext("2d"), x, 0, x, Layout.getWindowHeight(), 1, BoardManager.getDefaultChalkColor());
	BoardManager.saveCurrentScreen();
}


function backgroundClear() {
	canvasBackground.getContext("2d").clearRect(0, 0, canvasBackground.width, canvasBackground.height);
}


function musicScore() {
	backgroundClear();
	let COLORSTAFF = "rgb(128, 128, 255)";
	let fullHeight = Layout.getWindowHeight() - 32;
	let x = container.scrollLeft;
	let x2 = container.scrollLeft + Layout.getWindowWidth();
	let ymiddleScreen = fullHeight / 2;
	let yshift = fullHeight / 7;
	let drawStaff = (ymiddle) => {
		let space = fullHeight / 30;

		for (let i = -2; i <= 2; i++) {
			let y = ymiddle + i * space;
			drawLine(canvasBackground.getContext("2d"), x, y, x2, y, 1.0, COLORSTAFF);
		}
	}


	drawStaff(ymiddleScreen - yshift);
	drawStaff(ymiddleScreen + yshift);

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