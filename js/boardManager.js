/**
 * Manage the board
 */
class BoardManager {

    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    static boardName = 0;

    /** stack to store the cancel/redo actions */
    static cancelStack = new CancelStack();

    /**
   * initialization (button)
   */
    static init() {
        document.getElementById("blackboardClear").onclick = () => {
            BoardManager._clear();
            BoardManager.save();
            document.getElementById("menu").hidden = true;
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

    /**
     * save the current board into the cancel/redo stack but also in the localStorage of the browser
     */
    static save() {
        let data = document.getElementById("canvas").toDataURL();
        localStorage.setItem(BoardManager.boardName, data);

        BoardManager.cancelStack.push(data);
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
     * 
     * @param {*} level 
     */
    static _loadCurrentCancellationStackData(data) {
        let image = new Image();
        image.src = data;
        image.onload = function () {
            document.getElementById("canvas").width = image.width;
            document.getElementById("canvas").height = image.height;
            document.getElementById("canvas").getContext("2d").drawImage(image, 0, 0);
        }
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