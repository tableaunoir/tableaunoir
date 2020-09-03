class BoardManager {

    static boardName = 0;

    static save() {
        let data = document.getElementById("canvas").toDataURL();
        localStorage.setItem(BoardManager.boardName, data);
    }


    static clear() {
        document.getElementById("canvas").width = document.getElementById("canvas").width; //clear
    }


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


    static resize() {
        if (document.getElementById("canvas").width < window.innerWidth)
            document.getElementById("canvas").width = window.innerWidth;

        if (document.getElementById("canvas").height < window.innerHeight)
            document.getElementById("canvas").height = window.innerHeight;
    }

    static init() {
        document.getElementById("blackboardClear").onclick = () => {
            BoardManager.clear();
            BoardManager.save();
            document.getElementById("menu").hidden = true;
        }
    }
}