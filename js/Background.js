var Background = /** @class */ (function () {
    function Background() {
    }
    Background.init = function () {
        document.getElementById("buttonNoBackground").onclick = function () { Background.clear(); Menu.hide(); };
        document.getElementById("buttonMusicScore").onclick = function () { Background.musicScore(); Menu.hide(); };
        document.getElementById("inputBackground").onchange = function (evt) {
            LoadSave.fetchImageFromFile(this.files[0], function (img) {
                Background.clear();
                var canvasBackground = getCanvasBackground();
                var height = Layout.getWindowHeight();
                var scaleWidth = img.width * height / img.height;
                var x = (Layout.getWindowWidth() - scaleWidth) / 2;
                console.log(img);
                canvasBackground.getContext("2d").drawImage(img, x, 0, scaleWidth, height);
            });
        };
    };
    Background.clear = function () {
        var canvasBackground = getCanvasBackground();
        canvasBackground.getContext("2d").clearRect(0, 0, canvasBackground.width, canvasBackground.height);
    };
    Background.musicScore = function () {
        Background.clear();
        var COLORSTAFF = "rgb(128, 128, 255)";
        var fullHeight = Layout.getWindowHeight() - 32;
        var container = document.getElementById("container");
        var canvasBackground = getCanvasBackground();
        var x = 0;
        var x2 = 2 * Layout.getWindowWidth();
        var ymiddleScreen = fullHeight / 2;
        var yshift = fullHeight / 7;
        var drawStaff = function (ymiddle) {
            var space = fullHeight / 30;
            for (var i = -2; i <= 2; i++) {
                var y = ymiddle + i * space;
                drawLine(canvasBackground.getContext("2d"), x, y, x2, y, 1.0, COLORSTAFF);
            }
        };
        drawStaff(ymiddleScreen - yshift);
        drawStaff(ymiddleScreen + yshift);
        BoardManager.saveCurrentScreen();
    };
    return Background;
}());
//# sourceMappingURL=Background.js.map