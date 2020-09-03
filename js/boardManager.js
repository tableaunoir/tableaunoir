/**
 * Manage the board
 */
class BoardManager {

    /** name of the board. Default is 0 (this name is used for storing in localStorage) */
    static boardName = 0;


    /**
   * initialization (button)
   */
    static init() {
        document.getElementById("blackboardClear").onclick = () => {
            BoardManager.clear();
            BoardManager.save();
            document.getElementById("menu").hidden = true;
        }
    }

    /**
        * erase the board
        */
    static clear() {
        document.getElementById("canvas").width = document.getElementById("canvas").width; //clear
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
     * save the current board
     */
    static save() {
        let data = document.getElementById("canvas").toDataURL();
        localStorage.setItem(BoardManager.boardName, data);
    }


    /**
     * load the board
     */
    static load() {
        let data = localStorage.getItem(BoardManager.boardName);

        if (data != undefined) {
            BoardManager.clear();
            let image = new Image();
            image.src = data;
            image.onload = function () {
                document.getElementById("canvas").width = image.width;
                document.getElementById("canvas").height = image.height;
                document.getElementById("canvas").getContext("2d").drawImage(image, 0, 0);
                console.log("loaded!")
            }
        }
        else
            BoardManager.clear();
    }




}