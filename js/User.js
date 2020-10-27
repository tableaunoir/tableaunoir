class User {
    xInit = 0;
    yInit = 0;

    x = 0;
    y = 0;
    isDrawing = false;
    alreadyDrawnSth = false; // true if something visible has been drawn (If still false, draw a dot)
    eraseMode = false;
    eraseModeBig = false;
    lastDelineation = new Delineation();
    color = "white";

    userID = 0;

    setUserID(userID) {
        this.userID = userID;
    }

    init() {
        document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(this.color);
    }


    setCurrentColor(color) {
        this.color = color;
        document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(this.color);
    }

    switchChalkEraser() {
        this.eraseMode = !this.eraseMode;

        if (this.eraseMode) {

        }
        else {

        }
    }


    switchChalk() {
        this.eraseMode = false;

        if (this.isCurrentUser()) {
            document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(palette.getCurrentColor());
            buttonEraser.innerHTML = "Eraser";
        }

    }

    /**
     * @returns true iff the user is the current user (the one that controls the mouse)
     */
    isCurrentUser() {
        return (this == user);
    }

    switchErase() {
        this.eraseMode = true;

        if (this.isCurrentUser()) {
            palette.hide();
            document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor();
            buttonEraser.innerHTML = "Chalk";
        }
    }


    mousedown(evt) {
        MagnetManager.setInteractable(false);

        //unselect the selected element (e.g. a text in edit mode)
        document.activeElement.blur();


        //console.log("mousedown")
        this.x = evt.offsetX;
        this.y = evt.offsetY;
        this.xInit = this.x;
        this.yInit = this.y;
        this.isDrawing = true;
        this.eraseModeBig = false;


        this.lastDelineation.reset();
        this.lastDelineation.addPoint({ x: this.x, y: this.y });

        palette.hide();
    }



    mousemove(evt) {
        //console.log("mousemove")

        let evtX = evt.offsetX;
        let evtY = evt.offsetY;

        if (this.isDrawing && this.lastDelineation.isDrawing()) {
            palette.hide();
            if (this.eraseMode) {
                let lineWidth = 10;

                lineWidth = 10 + 30 * evt.pressure;

                if (Math.abs(this.x - this.xInit) > window.innerWidth / 4 || Math.abs(this.y - this.yInit) > window.innerHeight / 4)
                    this.eraseModeBig = true;

                if (this.eraseModeBig) {
                    lineWidth = 128;
                }


                clearLine(this.x, this.y, evtX, evtY, lineWidth);
            }
            else {

                
                drawLine(this.x, this.y, evtX, evtY, evt.pressure, this.color);

                this.lastDelineation.addPoint({ x: evtX, y: evtY });

            }
            this.x = evtX;
            this.y = evtY;

            if (Math.abs(this.x - this.xInit) > 1 || Math.abs(this.y - this.yInit) > 1)
                this.alreadyDrawnSth = true;
        }

        this.x = evtX;
        this.y = evtY;
    }


    mouseup(evt) {
        MagnetManager.setInteractable(true);
        this.lastDelineation.finish();


        //console.log("mouseup")
        if (this.isDrawing && !this.eraseMode && !this.alreadyDrawnSth) {
            drawDot(this.x, this.y, this.color);
        }

        if (this.eraseMode) //restore the eraser to the original size
            document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor();

        this.alreadyDrawnSth = false;
        this.isDrawing = false;
        BoardManager.saveCurrentScreen();
    }
}