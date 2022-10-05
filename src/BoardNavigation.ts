import { Share } from './share';
import { UserManager } from './UserManager';
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
        BoardNavigation.setScroll(0);
    }


    static _rightExtendCanvasEnable = true;


    /**
     * @returns the number of pixels when scrolling slowly
     */
    static scrollQuantity(): number { return 100; }




    private static _left(x: number): void {
        if (x <= 0) {
            BoardNavigation.showPageNumber(0);
            x = 0;
        }
        BoardNavigation.setScroll(x);
    }







    private static _right(x: number): void {
        const MAXCANVASWIDTH = 32000;
        const container = getContainer();
        const canvas = getCanvas();
        document.getElementById("buttonLeft").classList.remove("disabled");
        if (container.scrollLeft >= MAXCANVASWIDTH - Layout.getWindowWidth()) {
            container.scrollLeft = MAXCANVASWIDTH - Layout.getWindowWidth();
            return;
        }

        if (x >= canvas.width - Layout.getWindowWidth()) {
            if (BoardNavigation._rightExtendCanvasEnable) {
                Share.execute("setWidthAtLeast", [((canvas.width / Layout.scrollQuantityPage()) + 1) * Layout.scrollQuantityPage()]);
                BoardNavigation._rightExtendCanvasEnable = false;
                setTimeout(() => { BoardNavigation._rightExtendCanvasEnable = true }, 1000);//prevent to extend the canvas too many times
            }

            x = Math.min(x, canvas.width - Layout.getWindowWidth());
        }

        BoardNavigation.setScroll(x);

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


    static setScroll(x: number): void {
        if (x <= 0)
            document.getElementById("buttonLeft").classList.add("disabled");

        if (x != getContainer().scrollLeft) {
            getContainer().scrollTo({ top: 0, left: x, behavior: 'smooth' });

            /*
            on MacOS, iOS or other Apple technologies, also on Webkit, there is a bug with
            smooth scrolling. See issue #232
            so, we check whether the scrollTo with the smooth scrolling works, if not
            let us do a simple scrolling thing, which hopefully works :)
            */
            setTimeout(() => {
                if (getContainer().scrollLeft != x)
                    getContainer().scrollTo({ top: 0, left: x })
            }, 500);

        }

        setTimeout(UserManager.setSymbolCursorPosition, 1000);
    }


    /**
 * go left
 */
    static leftPreviousPage(): void {
        const container = getContainer();
        const xCorrected = Layout.isCalibratedHalfPage() ? Math.max(0, container.scrollLeft - Layout.scrollQuantityPage()) :
            Layout.correctOnLeft(container.scrollLeft);

        BoardNavigation._left(xCorrected);
        BoardNavigation.showPageNumber(xCorrected);
    }

    /**
    * go right (and extend the board if necessary)
    */
    static rightNextPage(): void {
        const xCorrected = Layout.isCalibratedHalfPage() ? getContainer().scrollLeft + Layout.scrollQuantityPage() :
            Layout.correctOnRight(getContainer().scrollLeft);
        BoardNavigation._right(xCorrected);
        BoardNavigation.showPageNumber(xCorrected);
    }

    /**
     * 
     * @param x show the page number on the top right
     */
    static showPageNumber(x: number): void {
        const pageNumber = document.getElementById("pageNumber");
        const canvas = getCanvas();

        pageNumber.classList.remove("pageNumberHidden");
        pageNumber.classList.remove("pageNumber");
        setTimeout(() => {
            const n = Math.round(x / Layout.scrollQuantityPage());
            const total = Math.round(canvas.width / Layout.scrollQuantityPage());
            pageNumber.innerHTML = (n + 1) + "/" + (total); pageNumber.classList.add("pageNumber");
        }, 300)

    }
}