class Layout {
    static getXMiddle() {
        return document.getElementById("container").scrollLeft + Layout.getWindowWidth() / 2;
    }

    static STANDARDHEIGHT = 1000;

    static getWindowWidth: () => number;
    static getWindowHeight: () => number;
    static getZoom: () => number;

    /**
     * initialization
     */
    static init() {
        console.log("Layout.init()")
        Layout.initWorWT();

    }


    /**
     * @returns true if the device is a smartphone or tablet, false if it is a computer
     */
    static isTactileDevice() {
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
    }



    static initClassic() {
        let WIDTH = 4800;
        let HEIGHT = 1500;

        const canvas = getCanvas();

        if (canvas.width < WIDTH)
            canvas.width = WIDTH;

        if (canvas.height < HEIGHT)
            canvas.height = HEIGHT;

        Layout.getWindowWidth = () => { return window.innerWidth; };
        Layout.getWindowHeight = () => { return window.innerHeight; };
        Layout.getZoom = () => { return 1; }
        Layout._resize();

    }


    /**
     * rescaling with the screen
     */
    static initS() {
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;

        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;

        window.addEventListener("resize", Layout._resize);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => { return Layout.STANDARDHEIGHT / screen.height; };
        Layout._resize();
    }


    /**
        * rescaling with the screen
        */
    static initW() {
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;

        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;

        window.addEventListener("resize", Layout._resize);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => {
            const innerHeight = window.innerHeight;

            return Layout.STANDARDHEIGHT / innerHeight;
        };
        Layout._resize();
    }


    /**
     * rescaling with the screen
     */
    static initWorWT() {
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();
        const content = document.getElementById("content");
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;

        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;

        window.addEventListener("resize", Layout._resize);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => {
            const toolbar = document.getElementById("controls");
            const innerHeight = window.innerHeight - (toolbar.hidden ? 0 : toolbar.clientHeight);
            let heightused;
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
    }



    static _resize() {
        console.log("resize");
        //if(window.innerHeight > Layout.STANDARDHEIGHT)
        const zoom = Layout.getZoom();
        const contentElement = document.getElementById("content");
        contentElement.style.width = window.innerWidth * zoom + "px";
        contentElement.style.transform = `scale(${1 / Layout.getZoom()})`;
        //BoardManager.resize(window.innerWidth, window.innerHeight);

    }


}

