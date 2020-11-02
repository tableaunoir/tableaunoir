class Layout {

    static STANDARDHEIGHT = 1000;

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



    static getZoom() {
        return Layout.STANDARDHEIGHT / window.innerHeight;
    }
    static _initModeClassic() {
        if (document.getElementById("canvas").width < window.innerWidth)
            document.getElementById("canvas").width = window.innerWidth;

        if (document.getElementById("canvas").height < window.innerHeight)
            document.getElementById("canvas").height = window.innerHeight;

        Layout.getWindowWidth = () => { return window.innerWidth; };
        Layout.getWindowHeight = () => { return window.innerHeight; };

    }

    static _initModeResize() {
        document.getElementById("canvas").height = Layout.STANDARDHEIGHT;
        document.getElementById("canvas").width = 4800;

        document.getElementById("canvasBackground").height = Layout.STANDARDHEIGHT;
        document.getElementById("canvasBackground").width = 4800;

        window.addEventListener("resize", Layout._resize);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return Layout.STANDARDHEIGHT * window.innerWidth / window.innerHeight; };

        Layout._resize();
    }



    static _resize() {
        console.log("resize");
        //if(window.innerHeight > Layout.STANDARDHEIGHT)
        document.getElementById("content").style.transform = `scale(${screen.height / Layout.STANDARDHEIGHT})`;
        //BoardManager.resize(window.innerWidth, window.innerHeight);

    }


}

/**
* resize the board to the size of the window
*/
/*
static resize() {

}*/