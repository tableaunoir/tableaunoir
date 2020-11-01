const ERASEMODEDEFAULTSIZE = 10;

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
    canWrite = true;

    color = "white";

    cursor = undefined;

    userID = 0;

    setUserID(userID) {
        this.userID = userID;
    }

    setCanWrite(bool) {
        this.canWrite = bool;
    }

    /**
     * 
     * @param {*} isCurrentUser that tells whether the user is the current one
     * @description create the user. 
     */
    constructor(isCurrentUser) {
        this.cursor = document.createElement("div");
        this.cursor.classList.add("cursor");

        if (isCurrentUser)
            this.cursor.hidden = true;

        document.getElementById("cursors").appendChild(this.cursor);
        if (isCurrentUser)
            document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(this.color);
    }



    updateCursor() {
        if (this.isCurrentUser()) {
            document.getElementById("canvas").style.cursor = ChalkCursor.getStyleCursor(this.color);
        }
    }

    /**
     * tells that the user has disconnected
     */
    destroy() {
        document.getElementById("cursors").removeChild(this.cursor);
    }

    setCurrentColor(color) {
        this.color = color;
        this.updateCursor();
    }

    getCurrentColor() {
        return this.color;
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
            this.updateCursor();
            buttonEraser.innerHTML = "⌫ Eraser";
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
            buttonEraser.innerHTML = "🖊 Chalk";
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

        if (this.canWrite) {
            if (this.eraseMode) {
                clearLine(this.x, this.y, this.x, this.y, ERASEMODEDEFAULTSIZE);
            }
            else {
                this.lastDelineation.reset();
                this.lastDelineation.addPoint({ x: this.x, y: this.y });
            }

        }


        palette.hide();
    }



    mousemove(evt) {
        let evtX = evt.offsetX;
        let evtY = evt.offsetY;

        this.cursor.style.left = evtX - 8;
        this.cursor.style.top = evtY - 8;

        if (this.canWrite) {
            if (this.isDrawing) {//} && this.lastDelineation.isDrawing()) {
                palette.hide();
                if (this.eraseMode) {
                    let lineWidth = 10;

                    lineWidth = 10 + 30 * evt.pressure;

                    if (Math.abs(this.x - this.xInit) > window.innerWidth / 4 || Math.abs(this.y - this.yInit) > window.innerHeight / 4)
                        this.eraseModeBig = true;

                    if (this.eraseModeBig) {
                        lineWidth = 128;
                    }

                    if (this.isCurrentUser())
                        document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor(lineWidth);
                    clearLine(this.x, this.y, evtX, evtY, lineWidth);
                }
                else {

                    if (this.lastDelineation.isDrawing()) {//this guard is because, when a magnet is created the user does not know the drawing stopped.
                        drawLine(document.getElementById("canvas").getContext("2d"), this.x, this.y, evtX, evtY, evt.pressure, this.color);
                        this.lastDelineation.addPoint({ x: evtX, y: evtY });
                    } 
                        

                    

                }

                if (Math.abs(this.x - this.xInit) > 1 || Math.abs(this.y - this.yInit) > 1)
                    this.alreadyDrawnSth = true;
            }
        }

        this.x = evtX;
        this.y = evtY;
    }


    mouseup(evt) {
        MagnetManager.setInteractable(true);

        if (this.canWrite) {
            this.lastDelineation.finish();


            //console.log("mouseup")
            if (this.isDrawing && !this.eraseMode && !this.alreadyDrawnSth) {
                drawDot(this.x, this.y, this.color);
            }

            if (this.isCurrentUser()) {
                if (this.eraseMode) //restore the eraser to the original size
                    document.getElementById("canvas").style.cursor = EraserCursor.getStyleCursor();
            }



            BoardManager.saveCurrentScreen();
        }
        this.alreadyDrawnSth = false;
        this.isDrawing = false;
    }
}