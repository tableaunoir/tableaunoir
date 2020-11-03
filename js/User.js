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
    eraseLineWidth = ERASEMODEDEFAULTSIZE;

    color = "white";

    cursor = undefined;
    toolCursor = undefined;

    userID = 0;

    setUserID(userID) {
        this.userID = userID;
    }

    setCanWrite(bool) {
        this.canWrite = bool;
    }


    setToolCursorImage(srcImage) {
        document.getElementById("canvas").style.cursor = `url(${srcImage.data}) ${srcImage.x} ${srcImage.y}, auto`;
        // this.toolCursor.src = srcImage;
    }

    /**
     * 
     * @param {*} isCurrentUser that tells whether the user is the current one
     * @description create the user. 
     */
    constructor(isCurrentUser) {
        this.cursor = document.createElement("div");
        this.cursor.classList.add("cursor");

        this.toolCursor = document.createElement("img");
        this.toolCursor.classList.add("toolcursor");



        if (isCurrentUser)
            this.cursor.hidden = true;
        if (!isCurrentUser)
            this.toolCursor.hidden = true;

        document.getElementById("cursors").appendChild(this.cursor);
        document.getElementById("cursors").appendChild(this.toolCursor);
        if (isCurrentUser)
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.color));
    }



    updateCursor() {
        if (this.isCurrentUser()) {
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.color));
        }
    }

    /**
     * tells that the user has disconnected
     */
    destroy() {
        document.getElementById("cursors").removeChild(this.cursor);
        document.getElementById("cursors").removeChild(this.toolCursor);
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
        return (this == UserManager.me);
    }

    switchErase() {
        this.eraseMode = true;

        if (this.isCurrentUser()) {
            palette.hide();
            this.setToolCursorImage(EraserCursor.getStyleCursor(this.eraseLineWidth));
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
                    this.eraseLineWidth = 10;

                    this.eraseLineWidth = 10 + 30 * evt.pressure;

                    if (Math.abs(this.x - this.xInit) > Layout.getWindowWidth() / 4 || Math.abs(this.y - this.yInit) > Layout.getWindowHeight() / 4)
                        this.eraseModeBig = true;

                    if (this.eraseModeBig) {
                        this.eraseLineWidth = 128;
                    }

                    if (this.isCurrentUser()) {
                        this.setToolCursorImage(EraserCursor.getStyleCursor(this.eraseLineWidth));
                    }

                    clearLine(this.x, this.y, evtX, evtY, this.eraseLineWidth);
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

        if (this.eraseMode) {
            this.toolCursor.style.left = evtX - this.eraseLineWidth / 2;
            this.toolCursor.style.top = evtY - this.eraseLineWidth / 2;
        }
        else {
            this.toolCursor.style.left = evtX;
            this.toolCursor.style.top = evtY
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
                if (this.eraseMode) {//restore the eraser to the original size {
                    this.eraseLineWidth = ERASEMODEDEFAULTSIZE;
                    this.setToolCursorImage(EraserCursor.getStyleCursor(this.eraseLineWidth));
                }

            }

            BoardManager.saveCurrentScreen();
        }
        this.alreadyDrawnSth = false;
        this.isDrawing = false;
    }
}