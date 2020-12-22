import { Layout } from './Layout';
import { getCanvas, getContainer } from "./main";



/**
 * this class handles the navigation in the board (halfpage by halfpage etc.)
 */
export class BoardNavigation {

    /**
     * initialize the navigation to be to the most-left part of the canvas (sometimes scrollLeft is not set to 0
     * because the browser stores its value)
     */
    static init(): void {
        getContainer().scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }


    static _rightExtendCanvasEnable = true;


    /**
     * @returns the number of pixels when scrolling slowly
     */
    static scrollQuantity(): number { return 100; }




    private static _left(x: number): void {
        if (x < 0) {
            BoardNavigation.showPageNumber(0);
            return;
        }

        getContainer().scrollTo({ top: 0, left: x, behavior: 'smooth' });
    }







    private static _right(x: number): void {
        const MAXCANVASWIDTH = 20000;
        const container = getContainer();
        const canvas = getCanvas();
        if (container.scrollLeft >= MAXCANVASWIDTH - Layout.getWindowWidth()) {
            container.scrollLeft = MAXCANVASWIDTH - Layout.getWindowWidth();
            return;
        }

        if (x >= canvas.width - Layout.getWindowWidth()) {
            if (BoardNavigation._rightExtendCanvasEnable) {
                const image = new Image();
                image.src = canvas.toDataURL();
                console.log("extension: canvas width " + canvas.width + " to " + (container.scrollLeft + Layout.getWindowWidth()))
                canvas.width = ((canvas.width / Layout.scrollQuantityHalfPage()) + 1) * Layout.scrollQuantityHalfPage();
                const context = canvas.getContext("2d");
                context.globalCompositeOperation = "source-over";
                context.globalAlpha = 1.0;
                image.onload = function () {
                    context.drawImage(image, 0, 0);
                }
                BoardNavigation._rightExtendCanvasEnable = false;
                setTimeout(() => { BoardNavigation._rightExtendCanvasEnable = true }, 1000);//prevent to extend the canvas too many times
            }

            x = Math.min(x, canvas.width - Layout.getWindowWidth());
        }

        container.scrollTo({ top: 0, left: x, behavior: 'smooth' });

    }



    /**
   * go left
   */
    static left(): void {
        BoardNavigation._left(getContainer().scrollLeft - BoardNavigation.scrollQuantity());
    }


    /**
     * go right (and extend the board if necessary)
     */
    static right(): void {
        const x = getContainer().scrollLeft + BoardNavigation.scrollQuantity();
        BoardNavigation._right(x);
    }




    /**
 * go left
 */
    static leftPreviousPage(): void {
        const container = getContainer();
        const xCorrected = Layout.isCalibratedHalfPage() ? Math.max(0, container.scrollLeft - Layout.scrollQuantityHalfPage()) :
            Layout.correctOnLeft(container.scrollLeft);

        BoardNavigation._left(xCorrected);
        BoardNavigation.showPageNumber(xCorrected);
    }

    /**
    * go right (and extend the board if necessary)
    */
    static rightNextPage(): void {
        const xCorrected = Layout.isCalibratedHalfPage() ? getContainer().scrollLeft + Layout.scrollQuantityHalfPage() :
            Layout.correctOnRight(getContainer().scrollLeft);
        BoardNavigation._right(xCorrected);
        BoardNavigation.showPageNumber(xCorrected);
    }


    static showPageNumber(x: number): void {
        const pageNumber = document.getElementById("pageNumber");
        const canvas = getCanvas();

        pageNumber.classList.remove("pageNumberHidden");
        pageNumber.classList.remove("pageNumber");
        setTimeout(() => {
            const n = Math.round(x / Layout.scrollQuantityHalfPage());
            const total = Math.round(canvas.width / Layout.scrollQuantityHalfPage());
            pageNumber.innerHTML = (n + 1) + "/" + (total); pageNumber.classList.add("pageNumber");
        }, 300)

    }
}