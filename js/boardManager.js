/**
 * Manage the board
 */
var BoardManager = /** @class */ (function () {
    function BoardManager() {
    }
    /**
   * initialization (button)
   */
    BoardManager.init = function () {
        document.getElementById("blackboardClear").onclick = function () {
            Share.execute("boardClear", []);
        };
    };
    BoardManager.getBackgroundColor = function () {
        return document.getElementById("canvasBackground").style.backgroundColor;
    };
    /**
        * erase the board
        */
    BoardManager._clear = function () {
        var canvas = getCanvas();
        canvas.width = canvas.width; //clear
        BoardManager.cancelStack.clear();
    };
    BoardManager.getDefaultChalkColor = function () {
        return (document.getElementById("canvasBackground").style.backgroundColor == "black") ? "white" : "black";
    };
    BoardManager._createCanvasForRectangle = function (r) {
        var C = document.createElement("canvas");
        C.width = r.x2 - r.x1;
        C.height = r.y2 - r.y1;
        var ctx = C.getContext("2d");
        ctx.drawImage(getCanvas(), r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1, //coordinates in the canvas
        0, 0, r.x2 - r.x1, r.y2 - r.y1); //coordinates in the magnet
        return C;
    };
    /**
     *
     * @param {*} r a rectangle {x1, y1, x2, y2}
     * @description call the callback when the blob of the rectangle is created
     */
    BoardManager._toBlobOfRectangle = function (r, callback) {
        BoardManager._createCanvasForRectangle(r).toBlob(callback);
    };
    /**
  *
  * @param {*} r a rectangle {x1, y1, x2, y2}
  * @returns the content as a string of the image
  */
    BoardManager.getDataURLOfRectangle = function (r) {
        return BoardManager._createCanvasForRectangle(r).toDataURL();
    };
    BoardManager.isCancelRedoActivated = function () {
        return !Share.isShared(); //(!Share.isShared() && !Layout.isTactileDevice());
    };
    /**
     * save the current board into the cancel/redo stack but also in the localStorage of the browser
     */
    BoardManager.save = function () {
        // if (rectangle == undefined) {
        if (BoardManager.isCancelRedoActivated())
            getCanvas().toBlob(function (blob) {
                console.log("save that blob: " + blob);
                //  localStorage.setItem(Share.getTableauNoirID(), canvas.toDataURL());
                BoardManager.cancelStack.push(blob);
                //Share.sendFullCanvas(blob);
            });
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
    };
    BoardManager.getCurrentScreenRectangle = function () {
        var container = document.getElementById("container");
        var x1 = container.scrollLeft;
        var y1 = container.scrollTop;
        var x2 = x1 + Layout.getWindowWidth();
        var y2 = y1 + Layout.getWindowHeight();
        return { x1: x1, y1: y1, x2: x2, y2: y2 };
    };
    BoardManager.saveCurrentScreen = function () {
        BoardManager.save();
    };
    /**
     * load the board from the local storage
     */
    BoardManager.load = function (data) {
        // let data = localStorage.getItem(BoardManager.boardName);
        if (data === void 0) { data = localStorage.getItem(Share.getTableauNoirID()); }
        if (data != undefined) {
            BoardManager._clear();
            try {
                var image_1 = new Image();
                image_1.src = data;
                image_1.onload = function () {
                    var canvas = getCanvas();
                    canvas.width = image_1.width;
                    canvas.height = image_1.height;
                    canvas.getContext("2d").drawImage(image_1, 0, 0);
                    BoardManager.save();
                    console.log("loaded!");
                };
            }
            catch (e) {
            }
        }
        else {
            BoardManager._clear();
            BoardManager.save();
        }
    };
    /**
     * load the board from the local storage
     */
    BoardManager.loadWithoutSave = function (data) {
        // let data = localStorage.getItem(BoardManager.boardName);
        if (data === void 0) { data = localStorage.getItem(BoardManager.boardName); }
        if (data != undefined) {
            BoardManager._clear();
            var image_2 = new Image();
            image_2.src = data;
            image_2.onload = function () {
                var canvas = getCanvas();
                canvas.width = image_2.width;
                canvas.height = image_2.height;
                canvas.getContext("2d").drawImage(image_2, 0, 0);
                console.log("loaded!");
            };
        }
        else {
            BoardManager._clear();
        }
    };
    /**
     * @returns the number of pixels when scrolling
     */
    BoardManager.scrollQuantity = function () {
        var THESHOLD = 1500;
        var middle = Layout.getWindowWidth() / 2;
        return Math.min(middle, THESHOLD);
    };
    /**
     * go left
     */
    BoardManager.left = function () {
        var container = getContainer();
        var x = container.scrollLeft - BoardManager.scrollQuantity();
        if (x < 0) {
            BoardManager.showPageNumber(0);
            return;
        }
        container.scrollTo({ top: 0, left: x, behavior: 'smooth' });
        BoardManager.showPageNumber(x);
    };
    /**
     * go right (and extend the board if necessary)
     */
    BoardManager.right = function () {
        var MAXCANVASWIDTH = 20000;
        var container = getContainer();
        var canvas = getCanvas();
        if (container.scrollLeft >= MAXCANVASWIDTH - Layout.getWindowWidth()) {
            container.scrollLeft = MAXCANVASWIDTH - Layout.getWindowWidth();
            return;
        }
        if ((container.scrollLeft >= canvas.width - Layout.getWindowWidth() - BoardManager.scrollQuantity()) && BoardManager._rightExtendCanvasEnable) {
            var image_3 = new Image();
            image_3.src = canvas.toDataURL();
            console.log("extension: canvas width " + canvas.width + " to " + (container.scrollLeft + Layout.getWindowWidth()));
            canvas.width = ((canvas.width / BoardManager.scrollQuantity()) + 1) * BoardManager.scrollQuantity();
            var context_1 = canvas.getContext("2d");
            context_1.globalCompositeOperation = "source-over";
            context_1.globalAlpha = 1.0;
            image_3.onload = function () {
                context_1.drawImage(image_3, 0, 0);
            };
            BoardManager._rightExtendCanvasEnable = false;
            setTimeout(function () { BoardManager._rightExtendCanvasEnable = true; }, 1000); //prevent to extend the canvas too many times
        }
        var x = container.scrollLeft + BoardManager.scrollQuantity();
        container.scrollTo({ top: 0, left: x, behavior: 'smooth' });
        BoardManager.showPageNumber(x);
    };
    BoardManager.showPageNumber = function (x) {
        var pageNumber = document.getElementById("pageNumber");
        var canvas = getCanvas();
        var container = getContainer();
        pageNumber.classList.remove("pageNumberHidden");
        pageNumber.classList.remove("pageNumber");
        setTimeout(function () {
            var n = Math.round(x / BoardManager.scrollQuantity());
            var total = Math.round(canvas.width / BoardManager.scrollQuantity());
            container.scrollLeft = (n) * BoardManager.scrollQuantity();
            pageNumber.innerHTML = (n + 1) + "/" + (total);
            pageNumber.classList.add("pageNumber");
        }, 300);
    };
    /**
     *
     * @param {*} level
     */
    BoardManager._loadCurrentCancellationStackData = function (data) {
        var image = new Image();
        var canvas = getCanvas();
        var context = canvas.getContext("2d");
        context.globalCompositeOperation = "source-over";
        context.globalAlpha = 1.0;
        //  if (data instanceof Blob) {
        image.src = URL.createObjectURL(data);
        image.onload = function () {
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
        };
        /*  }
          else {
              console.log("_loadCurrentCancellationStackData with rectangle at " + data.x1)
              image.src = URL.createObjectURL(data.blob);
              image.onload = function () {
                  context.clearRect(data.x1, data.y1, data.x2 - data.x1, data.y2 - data.y1);
                  context.drawImage(image, data.x1, data.y1);
              }
          }*/ //still bugy
    };
    /**
     *
     */
    BoardManager.cancel = function () {
        if (BoardManager.isCancelRedoActivated())
            BoardManager._loadCurrentCancellationStackData(BoardManager.cancelStack.back());
    };
    /**
     *
     */
    BoardManager.redo = function () {
        if (BoardManager.isCancelRedoActivated())
            BoardManager._loadCurrentCancellationStackData(BoardManager.cancelStack.forward());
    };
    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    BoardManager.boardName = "0";
    /** stack to store the cancel/redo actions */
    BoardManager.cancelStack = new CancelStack();
    BoardManager._rightExtendCanvasEnable = true;
    return BoardManager;
}());
//# sourceMappingURL=boardManager.js.map