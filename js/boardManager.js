/**
 * Manage the board
 */
class BoardManager {

    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    static boardName = 0;

    /** stack to store the cancel/redo actions */
    static cancelStack = new CancelStack();

    static _rightExtendCanvasEnable = true;

    /**
   * initialization (button)
   */
    static init() {
        document.getElementById("blackboardClear").onclick = () => {
            BoardManager._clear();
            BoardManager.save();
            Menu.hide();
        }

    }

    /**
        * erase the board
        */
    static _clear() {
        document.getElementById("canvas").width = document.getElementById("canvas").width; //clear
        BoardManager.cancelStack.clear();
    }


    /**
 * resize the board to the size of the window
 */
    static resize() {
        if (document.getElementById("canvas").width < window.innerWidth)
            document.getElementById("canvas").width = window.innerWidth;

        if (document.getElementById("canvas").height < window.innerHeight)
            document.getElementById("canvas").height = window.innerHeight;
    }



    static _createCanvasForRectangle(r) {
        let C = document.createElement("canvas");
        C.width = r.x2 - r.x1;
        C.height = r.y2 - r.y1;
        let ctx = C.getContext("2d");
        ctx.drawImage(document.getElementById("canvas"),
            r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1, //coordinates in the canvas
            0, 0, r.x2 - r.x1, r.y2 - r.y1); //coordinates in the magnet
        return C;
    }


    /**
     * 
     * @param {*} r a rectangle {x1, y1, x2, y2}
     * @returns the content as a string of the image
     */
    static _toBlobOfRectangle(r, callback) {
        return BoardManager._createCanvasForRectangle(r).toBlob(callback);
    }



    /**
     * save the current board into the cancel/redo stack but also in the localStorage of the browser
     */
    static save(rectangle) {
        // if (rectangle == undefined) {
        document.getElementById("canvas").toBlob((blob) => {
            console.log("save that blob: " + blob)
            localStorage.setItem(BoardManager.boardName, blob);
            BoardManager.cancelStack.push(blob);
            Share.sendFullCanvas(blob);
        }
        );
        /*}
          else {
              BoardManager._toBlobOfRectangle(rectangle, (blob) => {
                  rectangle.blob = blob;
                  BoardManager.cancelStack.push(rectangle);
              });
    
              document.getElementById("canvas").toBlob((blob) => {
                  console.log("save that blob: " + blob)
                  localStorage.setItem(BoardManager.boardName, blob);
              }
              );
          }
    */


    }




    static getCurrentScreenRectangle() {
        const x1 = container.scrollLeft;
        const y1 = container.scrollTop;
        const x2 = x1 + window.innerWidth;
        const y2 = y1 + window.innerHeight;
        return { x1: x1, y1: y1, x2: x2, y2: y2 };
    }

    static saveCurrentScreen() {
        BoardManager.save(BoardManager.getCurrentScreenRectangle());
    }

    /**
     * load the board from the local storage
     */
    static load(data = localStorage.getItem(BoardManager.boardName)) {
        // let data = localStorage.getItem(BoardManager.boardName);

        if (data != undefined) {
            BoardManager._clear();
            let image = new Image();
            image.src = data;
            image.onload = function () {
                document.getElementById("canvas").width = image.width;
                document.getElementById("canvas").height = image.height;
                document.getElementById("canvas").getContext("2d").drawImage(image, 0, 0);
                BoardManager.save();
                console.log("loaded!")
            }
        }
        else {
            BoardManager._clear();
            BoardManager.save();
        }

    }




    /**
     * load the board from the local storage
     */
    static loadWithoutSave(data = localStorage.getItem(BoardManager.boardName)) {
        // let data = localStorage.getItem(BoardManager.boardName);

        if (data != undefined) {
            BoardManager._clear();
            let image = new Image();
            image.src = data;
            image.onload = function () {
                document.getElementById("canvas").width = image.width;
                document.getElementById("canvas").height = image.height;
                document.getElementById("canvas").getContext("2d").drawImage(image, 0, 0);
                console.log("loaded!")
            }
        }
        else {
            BoardManager._clear();
        }

    }

    /**
     * @returns the number of pixels when scrolling
     */
    static scrollQuantity() {
        return window.innerWidth / 2;
    }

    /**
     * go left
     */
    static left() {
        const x = container.scrollLeft - BoardManager.scrollQuantity();

        if (x < 0) {
            BoardManager.showPageNumber(0);
            return;
        }

        container.scrollTo({ top: 0, left: x, behavior: 'smooth' });
        BoardManager.showPageNumber(x);
    }

    /**
     * go right (and extend the board if necessary)
     */
    static right() {
        const MAXCANVASWIDTH = 20000;

        if (container.scrollLeft >= MAXCANVASWIDTH - window.innerWidth) {
            container.scrollLeft = MAXCANVASWIDTH - window.innerWidth;
            return;
        }

        if ((container.scrollLeft >= canvas.width - window.innerWidth - BoardManager.scrollQuantity()) && BoardManager._rightExtendCanvasEnable) {
            let image = new Image();
            image.src = canvas.toDataURL();
            console.log("extension: canvas width " + canvas.width + " to " + (container.scrollLeft + window.innerWidth))
            canvas.width = ((canvas.width / BoardManager.scrollQuantity()) + 1) * BoardManager.scrollQuantity();
            const context = document.getElementById("canvas").getContext("2d");
            context.globalCompositeOperation = "source-over";
            context.globalAlpha = 1.0;
            image.onload = function () {
                context.drawImage(image, 0, 0);
            }
            BoardManager._rightExtendCanvasEnable = false;
            setTimeout(() => { BoardManager._rightExtendCanvasEnable = true }, 1000);
        }
        const x = container.scrollLeft + BoardManager.scrollQuantity();
        container.scrollTo({ top: 0, left: x, behavior: 'smooth' });
        BoardManager.showPageNumber(x);
    }


    static showPageNumber(x) {

        pageNumber.classList.remove("pageNumberHidden");
        pageNumber.classList.remove("pageNumber");
        setTimeout(() => {
            const n = Math.round(x / BoardManager.scrollQuantity());
            const total = Math.round(canvas.width / BoardManager.scrollQuantity());
            container.scrollLeft = (n) * BoardManager.scrollQuantity();
            pageNumber.innerHTML = (n + 1) + "/" + (total); pageNumber.classList.add("pageNumber");
        }, 300)

    }

    /**
     * 
     * @param {*} level 
     */
    static _loadCurrentCancellationStackData(data) {
        let image = new Image();

        const context = document.getElementById("canvas").getContext("2d");
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1.0;

        //  if (data instanceof Blob) {
        image.src = URL.createObjectURL(data);
        image.onload = function () {
            document.getElementById("canvas").width = image.width;
            document.getElementById("canvas").height = image.height;
            context.drawImage(image, 0, 0);
        }
        /*  }
          else {
              console.log("_loadCurrentCancellationStackData with rectangle at " + data.x1)
              image.src = URL.createObjectURL(data.blob);
              image.onload = function () {
                  context.clearRect(data.x1, data.y1, data.x2 - data.x1, data.y2 - data.y1);
                  context.drawImage(image, data.x1, data.y1);
              }
          }*/ //still bugy


    }

    /**
     * 
     */
    static cancel() {
        BoardManager._loadCurrentCancellationStackData(BoardManager.cancelStack.back());
    }



    /**
     * 
     */
    static redo() {
        BoardManager._loadCurrentCancellationStackData(BoardManager.cancelStack.forward());
    }
}