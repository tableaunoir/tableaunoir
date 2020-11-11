var Layout = /** @class */ (function () {
    function Layout() {
    }
    Layout.getXMiddle = function () {
        return document.getElementById("container").scrollLeft + Layout.getWindowWidth() / 2;
    };
    /**
     * initialization
     */
    Layout.init = function () {
        console.log("Layout.init()");
        Layout.initWorWT();
    };
    /**
     * @returns true if the device is a smartphone or tablet, false if it is a computer
     */
    Layout.isTactileDevice = function () {
        return navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/ipad/i)
            || navigator.userAgent.match(/iPAD/i)
            || navigator.userAgent.match(/IPAD/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i);
    };
    Layout.initClassic = function () {
        var WIDTH = 4800;
        var HEIGHT = 1500;
        var canvas = getCanvas();
        if (canvas.width < WIDTH)
            canvas.width = WIDTH;
        if (canvas.height < HEIGHT)
            canvas.height = HEIGHT;
        Layout.getWindowWidth = function () { return window.innerWidth; };
        Layout.getWindowHeight = function () { return window.innerHeight; };
        Layout.getZoom = function () { return 1; };
        Layout._resize();
    };
    /**
     * rescaling with the screen
     */
    Layout.initS = function () {
        var canvas = getCanvas();
        var canvasBackground = getCanvasBackground();
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;
        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;
        window.addEventListener("resize", Layout._resize);
        Layout.getWindowHeight = function () { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = function () { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = function () { return Layout.STANDARDHEIGHT / screen.height; };
        Layout._resize();
    };
    /**
        * rescaling with the screen
        */
    Layout.initW = function () {
        var canvas = getCanvas();
        var canvasBackground = getCanvasBackground();
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;
        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;
        window.addEventListener("resize", Layout._resize);
        Layout.getWindowHeight = function () { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = function () { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = function () {
            var innerHeight = window.innerHeight;
            return Layout.STANDARDHEIGHT / innerHeight;
        };
        Layout._resize();
    };
    /**
     * rescaling with the screen
     */
    Layout.initWorWT = function () {
        var canvas = getCanvas();
        var canvasBackground = getCanvasBackground();
        var content = document.getElementById("content");
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;
        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;
        window.addEventListener("resize", Layout._resize);
        Layout.getWindowHeight = function () { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = function () { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = function () {
            var toolbar = document.getElementById("controls");
            var innerHeight = window.innerHeight - (toolbar.hidden ? 0 : toolbar.clientHeight);
            var heightused;
            if (toolbar.clientHeight < window.innerHeight / 10) {
                heightused = window.innerHeight;
                content.style.position = "absolute";
            }
            else {
                heightused = innerHeight;
                content.style.position = "relative";
            }
            return Layout.STANDARDHEIGHT / heightused;
        };
        Layout._resize();
    };
    Layout._resize = function () {
        console.log("resize");
        //if(window.innerHeight > Layout.STANDARDHEIGHT)
        var zoom = Layout.getZoom();
        var contentElement = document.getElementById("content");
        contentElement.style.width = window.innerWidth * zoom + "px";
        contentElement.style.transform = "scale(" + 1 / Layout.getZoom() + ")";
        //BoardManager.resize(window.innerWidth, window.innerHeight);
    };
    Layout.STANDARDHEIGHT = 1000;
    return Layout;
}());
//# sourceMappingURL=Layout.js.map