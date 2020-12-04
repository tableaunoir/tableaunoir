import { OptionManager } from './OptionManager';
import { getCanvas, getCanvasBackground, getContainer } from './main';
import { Toolbar } from './Toolbar';

export class Layout {

    /**
 * @returns the number of pixels when scrolling
 */
    static scrollQuantityHalfPage(): number {
        const THESHOLD = 1500;
        const middle = Layout.getWindowWidth() / 2;
        return Math.min(middle, THESHOLD);
    }


    static isCalibratedHalfPage(): boolean {
        const x = getContainer().scrollLeft;
        return Math.abs(Layout.correctRound(x) - x) < 2;//getContainer().scrollLeft % Layout.scrollQuantityHalfPage() == 0;
    }

    static correctOnLeft(x: number): number {
        return Math.floor(x / Layout.scrollQuantityHalfPage()) * Layout.scrollQuantityHalfPage();
    }

    static correctRound(x: number): number {
        return Math.round(x / Layout.scrollQuantityHalfPage()) * Layout.scrollQuantityHalfPage();
    }

    static correctOnRight(x: number): number {
        return Math.ceil((x + 1) / Layout.scrollQuantityHalfPage()) * Layout.scrollQuantityHalfPage();
    }


    static getXMiddle(): number {
        return Layout.correctRound(document.getElementById("container").scrollLeft) + Layout.getWindowWidth() / 2;
    }


    static getWindowLeft(): number {
        return document.getElementById("container").scrollLeft;
    }


    static getWindowRight(): number {
        return document.getElementById("container").scrollLeft + Layout.getWindowWidth();
    }

    static STANDARDHEIGHT = 1000;

    static getWindowWidth: () => number;
    static getWindowHeight: () => number;
    static getZoom: () => number;

    /**
     * initialization
     */
    static init(): void {
        console.log("Layout.init()")
        Layout.initWorWT();

        OptionManager.boolean({
            name: "horizontalScrollbar",
            defaultValue: false,
            onChange: (isScrollbar) => {
                getContainer().style.overflowX = isScrollbar ? "scroll" : "hidden";
            }
        });

    }


    /**
     * @returns true if the device is a smartphone or tablet, false if it is a computer
     */
    static isTactileDevice(): RegExpMatchArray {
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



    static initClassic(): void {
        const WIDTH = 4800;
        const HEIGHT = 1500;

        const canvas = getCanvas();

        if (canvas.width < WIDTH)
            canvas.width = WIDTH;

        if (canvas.height < HEIGHT)
            canvas.height = HEIGHT;

        Layout.getWindowWidth = () => { return window.innerWidth; };
        Layout.getWindowHeight = () => { return window.innerHeight; };
        Layout.getZoom = () => { return 1; }
        Layout.layout();

    }


    /**
     * rescaling with the screen
     */
    static initS(): void {
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;

        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;

        window.addEventListener("resize", Layout.layout);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => { return Layout.STANDARDHEIGHT / screen.height; };
        Layout.layout();
    }


    /**
        * rescaling with the screen
        */
    static initW(): void {
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;

        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;

        window.addEventListener("resize", Layout.layout);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => {
            const innerHeight = window.innerHeight;

            return Layout.STANDARDHEIGHT / innerHeight;
        };
        Layout.layout();
    }


    /**
     * rescaling with the screen
     */
    static initWorWT(): void {
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();
        const content = document.getElementById("content");
        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = 4800;

        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = 4800;

        window.addEventListener("resize", Layout.layout);

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => {
            const toolbar = Toolbar.getToolbar();
            const innerHeight = window.innerHeight - (toolbar.hidden ? 0 : toolbar.clientHeight);
            let heightused;
            if (toolbar.clientHeight < window.innerHeight / 10 || Toolbar.left || Toolbar.right) {
                heightused = window.innerHeight;
                content.style.top = "0px";
                if (Toolbar.left)
                    content.style.left = "" + toolbar.clientWidth;
                else
                    content.style.left = "0px";

            }
            else {
                heightused = innerHeight;
                content.style.left = "0px";
                if (Toolbar.bottom)
                    content.style.top = "0px";
                else if (Toolbar.top)
                    content.style.top = "" + toolbar.clientHeight;

            }


            return Layout.STANDARDHEIGHT / heightused;
        };
        Layout.layout();
    }



    static layout(): void {
        console.log("resize");
        //if(window.innerHeight > Layout.STANDARDHEIGHT)
        const zoom = Layout.getZoom();
        const contentElement = document.getElementById("content");
        contentElement.style.width = window.innerWidth * zoom + "px";
        contentElement.style.transform = `scale(${1 / Layout.getZoom()})`;
        //BoardManager.resize(window.innerWidth, window.innerHeight);

    }





    /**
     * @description modifies the CSS width of some HTMLElement so that the rendering with html2canvas works well
     */
    static setForExportPng(): void {
        const nodeContent = document.getElementById("content");
        const nodeBoard = document.getElementById("board");
        nodeContent.style.width = "" + getCanvas().width;
        nodeBoard.style.width = "" + getCanvas().width;
        nodeContent.style.transform = "scale(1)";
    }



    /**
     * @description after the use of html2canvas, this function restores the CSS width of the elements 
     * that were modified.
     */
    static restoreForUse(): void {
        Layout.layout();
    }

}
