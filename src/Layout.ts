import { BoardManager } from './boardManager';
import { BoardNavigation } from './BoardNavigation';
import { OptionManager } from './OptionManager';
import { getCanvas, getCanvasBackground, getContainer } from './main';
import { Toolbar } from './Toolbar';

export class Layout {

    static isminimap: boolean;

    static get isMinimap(): boolean {
        return Layout.isminimap;
    }


    static toggleMinimap(): void {
        if (Layout.isMinimap) {
            Layout.normal();
        }
        else {
            Layout.minimap();
        }
    }
    /**
 * @returns the number of pixels when scrolling a page
 * a page is either halfscreen (when you teach)
 * or fullscreen when there is a pdf loaded
 */
    static scrollQuantityPage(): number {
        const THESHOLD = window.screen.availWidth * 2;
        const middle = Layout.getWindowWidth() / 2;
        return Math.min(middle, THESHOLD);
    }


    static isCalibratedHalfPage(): boolean {
        const x = getContainer().scrollLeft;
        return Math.abs(Layout.correctRound(x) - x) < 2;//getContainer().scrollLeft % Layout.scrollQuantityHalfPage() == 0;
    }

    static correctOnLeft(x: number): number {
        return Math.floor(x / Layout.scrollQuantityPage()) * Layout.scrollQuantityPage();
    }

    static correctRound(x: number): number {
        return Math.round(x / Layout.scrollQuantityPage()) * Layout.scrollQuantityPage();
    }

    static correctOnRight(x: number): number {
        return Math.ceil((x + 1) / Layout.scrollQuantityPage()) * Layout.scrollQuantityPage();
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
    static STANDARDWIDTH = 3000;

    static getWindowWidth: () => number;
    static getWindowHeight: () => number = () => Layout.STANDARDHEIGHT;
    static getZoom: () => number;

    /**
     * initialization
     */
    static init(): void {
        console.log("Layout.init()")
        const canvas = getCanvas();
        const canvasBackground = getCanvasBackground();

        Layout.initWorWT();

        canvas.height = Layout.STANDARDHEIGHT;
        canvas.width = Layout.STANDARDWIDTH;
        canvasBackground.height = Layout.STANDARDHEIGHT;
        canvasBackground.width = Layout.STANDARDWIDTH;

        OptionManager.boolean({
            name: "horizontalScrollbar",
            defaultValue: false,
            onChange: (isScrollbar) => {
                getContainer().style.overflowX = isScrollbar ? "scroll" : "hidden";
            }
        });

        window.addEventListener("resize", Layout.layout);

    }

    static TRANSITION = "all 350ms ease-out";


    static normal(): void {
        document.getElementById("buttonMap").classList.remove("buttonselected");
        const contentElement = document.getElementById("content");
        contentElement.style.transition = Layout.TRANSITION;
        contentElement.style.top = "0px";
        Layout.initWorWT();
        getCanvas().style.pointerEvents = "auto";

        const viewport = document.getElementById("viewport");
        viewport.hidden = true;

        const newviewport = document.getElementById("newviewport");
        newviewport.hidden = true;
        BoardNavigation.setScroll(parseInt(newviewport.style.left));
        contentElement.style.transition = "";
        const nodeBoard = document.getElementById("board");
        nodeBoard.onmousemove = undefined;
        nodeBoard.onmouseup = undefined;
        nodeBoard.onmouseleave = undefined;
        nodeBoard.onmouseenter = undefined;
    }

    static minimap(): void {
        if (BoardManager.width < Layout.getWindowWidth()) //no need to switch to minimap if the board is small
            return;

        document.getElementById("buttonMap").classList.add("buttonselected");
        console.log("minimap")
        const contentElement = document.getElementById("content");
        contentElement.style.transition = Layout.TRANSITION;
        Layout.isminimap = true;
        getCanvas().style.pointerEvents = "none";
        const x = Layout.getWindowLeft();
        BoardNavigation.setScroll(0);
        const boardWidth = BoardManager.width;
        console.log(boardWidth)
        if (boardWidth > Layout.getWindowWidth() * 1.5) {
            //only install the GUI for moving in the board when the board is large
            const viewport = document.getElementById("viewport");
            viewport.hidden = false;
            viewport.style.left = x + "";
            viewport.style.top = "0px";
            viewport.style.width = Layout.getWindowWidth() + "";
            viewport.style.height = Layout.getWindowHeight() + "";

            const newviewport = document.getElementById("newviewport");
            newviewport.hidden = false;
            newviewport.style.left = x + "";
            newviewport.style.top = "0px";
            newviewport.style.width = Layout.getWindowWidth() + "";
            newviewport.style.height = Layout.getWindowHeight() + "";

            const nodeBoard = document.getElementById("board");

            nodeBoard.onmousemove = (evt) => {
                let x = evt.offsetX - parseInt(viewport.style.width) / 2;
                if (x < 0) x = 0;
                x = Math.min(x, getCanvas().width - parseInt(viewport.style.width));
                newviewport.style.left = x + "";
            }
            nodeBoard.onmouseup = () => { Layout.normal(); }

            nodeBoard.onmouseleave = () => {
                newviewport.hidden = true;
                viewport.hidden = true;
            }

            nodeBoard.onmouseenter = () => {
                newviewport.hidden = false;
                viewport.hidden = false;
            }
        }
        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => {
            if (BoardManager.width / window.innerWidth > 1)
                return BoardManager.width / window.innerWidth;
            else
                return 1;
        };
        Layout.layout();
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



    /**
     * rescaling with the screen
     */
    static initWorWT(): void {
        Layout.isminimap = false;
        const content = document.getElementById("content");

        Layout.getWindowHeight = () => { return Layout.STANDARDHEIGHT; };
        Layout.getWindowWidth = () => { return window.innerWidth * Layout.getZoom(); };
        Layout.getZoom = () => {
            const toolbar = Toolbar.getToolbar();
     //       const innerHeight = window.innerHeight - (Toolbar.isHidden() ? 0 : toolbar.clientHeight);
            //  if (toolbar.clientHeight < window.innerHeight / 10 || Toolbar.left || Toolbar.right) {
            const heightused = window.innerHeight;
            content.style.top = "0px";
            /*          if (Toolbar.left)
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
      
                  }*/


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
        //contentElement.style.transition = `scale(${1 / Layout.getZoom()})`;
        contentElement.style.transform = `scale(${1 / Layout.getZoom()})`;
        //BoardManager.resize(window.innerWidth, window.innerHeight);
        if (this.isMinimap) {
            const h = Layout.STANDARDHEIGHT / zoom;
            const top = (window.innerHeight - h) / 2;
            //            console.log(`top: ${top}`);
            contentElement.style.top = top + "px";
        }
    }



    private static saveValueForContainerScrollleft = 0;


    /**
     * @description modifies the CSS width of some HTMLElement so that the rendering with html2canvas works well
     */
    static setForExportPng(): void {
        Layout.saveValueForContainerScrollleft = getContainer().scrollLeft;
        getContainer().scrollLeft = 0;
        const nodeContent = document.getElementById("content");
        const nodeBoard = document.getElementById("board");
        nodeContent.style.width = "" + getCanvas().width;
        nodeContent.style.height = "" + getCanvas().height;
        nodeBoard.style.width = "" + getCanvas().width;
        nodeBoard.style.height = "" + getCanvas().height;
        nodeContent.style.transition = "";
        nodeContent.style.transform = "scale(1)";
    }



    /**
     * @description after the use of html2canvas, this function restores the CSS width of the elements 
     * that were modified.
     */
    static restoreForUse(): void {
        const nodeContent = document.getElementById("content");
        nodeContent.style.transition = "";
        Layout.layout();
        getContainer().scrollLeft = Layout.saveValueForContainerScrollleft;
    }

}



window["Layout"] = Layout;