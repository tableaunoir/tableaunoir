class Layout {

    static STANDARDHEIGHT = 800;

    static init() {
        console.log("Layout.init()")
        Layout._initModeResize();

    }


    /**
     * @returns true if the device is a smartphone or tablet, false if it is a computer
     */
    static isTactileDevice() {
        return navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i);
    }



    static _initModeClassic() {
        let WIDTH = 4800;
        let HEIGHT = 1500;

        if (document.getElementById("canvas").width < WIDTH)
            document.getElementById("canvas").width = WIDTH;

        if (document.getElementById("canvas").height < HEIGHT)
            document.getElementById("canvas").height = HEIGHT;

        Layout.getWindowWidth = () => { return window.innerWidth; };
        Layout.getWindowHeight = () => { return window.innerHeight; };
        Layout.getZoom = () => { return 1; }
        Layout._resize();

    }

    static _initModeResize() {
        document.getElementById("canvas").height = Layout.STANDARDHEIGHT;
        document.getElementById("canvas").width = 4800;

        document.getElementById("canvasBackground").height = Layout.STANDARDHEIGHT;
        document.getElementById("canvasBackground").width = 4800;

        window.addEventListener("resize", Layout._resize);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => { return Layout.STANDARDHEIGHT / screen.height; };
        Layout._resize();
    }



    static _resize() {
        console.log("resize");
        //if(window.innerHeight > Layout.STANDARDHEIGHT)
        document.getElementById("content").style.transform = `scale(${1 / Layout.getZoom()})`;
        //BoardManager.resize(window.innerWidth, window.innerHeight);

    }


}

