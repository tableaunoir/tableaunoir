class BlackVSWhiteBoard {
    static init() {
        document.getElementById("canvas").style.backgroundColor = "black";
        document.getElementById("board").onclick = () => BlackVSWhiteBoard.switch(document.getElementById("board").value);
    }


    static switch(backgroundColor) {
        if (backgroundColor == document.getElementById("canvas").style.backgroundColor)
            return;

        console.log("previous background color was " + document.getElementById("canvas").style.backgroundColor);
        console.log("switch to " + backgroundColor + "board")
        palette.switchBlackAndWhite();
        document.getElementById("canvas").style.backgroundColor =
            (document.getElementById("canvas").style.backgroundColor == "white") ? "black" : "white";
        BlackVSWhiteBoard._invertCanvas();
    }



    static _invertCanvas() {
        let canvas = document.getElementById('canvas');
        var context = canvas.getContext('2d');

        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // red
            data[i] = 255 - data[i];
            // green
            data[i + 1] = 255 - data[i + 1];
            // blue
            data[i + 2] = 255 - data[i + 2];
        }

        // overwrite original image
        context.putImageData(imageData, 0, 0);
    }

}