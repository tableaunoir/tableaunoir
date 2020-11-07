/**
 * This class implements the switch between whiteboard and blackboard
 */
var BlackVSWhiteBoard = /** @class */ (function () {
    function BlackVSWhiteBoard() {
    }
    BlackVSWhiteBoard.init = function () {
        document.getElementById("canvasBackground").style.backgroundColor = "black";
        document.getElementById("whiteBoardSwitch").onclick = BlackVSWhiteBoard.switch;
        document.getElementById("blackBoardSwitch").onclick = BlackVSWhiteBoard.switch;
    };
    /**
     * switch between whiteboard and blackboard
     */
    BlackVSWhiteBoard.switch = function () {
        var previousBackgroundColor = document.getElementById("canvasBackground").style.backgroundColor;
        var backgroundColor = previousBackgroundColor == "white" ? "black" : "white";
        document.getElementById(backgroundColor + "BoardSwitch").hidden = true;
        document.getElementById(previousBackgroundColor + "BoardSwitch").hidden = false;
        console.log("previous background color was " + previousBackgroundColor);
        console.log("switch to " + backgroundColor + "board");
        palette.switchBlackAndWhite();
        document.getElementById("canvasBackground").style.backgroundColor = backgroundColor;
        if (backgroundColor == "black") {
            modifyCSSRule(".magnetText div", "background-color", "rgba(27, 27, 27, 0.9)");
            modifyCSSRule("div.magnetText", "background-color", "rgba(64, 64, 64, 0.9)");
            modifyCSSRule(".magnetText div", "color", "white");
        }
        else {
            modifyCSSRule(".magnetText div", "background-color", "rgba(247, 247, 247, 0.9)");
            modifyCSSRule("div.magnetText", "background-color", "rgba(227, 227, 227, 0.9)");
            modifyCSSRule(".magnetText div", "color", "black");
        }
        BlackVSWhiteBoard._invertCanvas();
    };
    /**
     * @dsecription invert the colors of the canvas (black becomes white, white becomes black, red becomes...)
     */
    BlackVSWhiteBoard._invertCanvas = function () {
        var canvas = getCanvas();
        var context = canvas.getContext('2d');
        var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            // red
            data[i] = 255 - data[i];
            // green
            data[i + 1] = 255 - data[i + 1];
            // blue
            data[i + 2] = 255 - data[i + 2];
        }
        // overwrite original image
        context.putImageData(imageData, 0, 0);
    };
    return BlackVSWhiteBoard;
}());
function modifyCSSRule(selector, property, value) {
    eval("jCSSRule(\"" + selector + "\", \"" + property + "\", \"" + value + "\")");
}
//# sourceMappingURL=BlackVSWhiteBoard.js.map