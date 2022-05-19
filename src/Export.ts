import { BoardManager } from './boardManager';
import { LoadSave } from './LoadSave';
import { Layout } from './Layout';
import { CircularMenu } from './CircularMenu';
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'



/**
 * @description this class enables to export the board in png and pdf
 */
export class Export {

    /**
     * @description connects the export function to the menu
     */
    static init(): void {
        document.getElementById("exportPng").onclick = Export.exportPng;
        document.getElementById("exportPdf").onclick = Export.exportPdf;
    }


    /**
     * @description export the board as a .png image file
     */
    static async exportPng(): Promise<void> {
        CircularMenu.hideAndRemove();
        Layout.setForExportPng();
        const bigCanvas = await Export.getCanvasBoard();
        const canvas = Export.extractFromCanvas(bigCanvas, 0, BoardManager.width);
        LoadSave.downloadDataURL((<HTMLInputElement>document.getElementById("exportPngName")).value + ".png", canvas.toDataURL());
        Layout.restoreForUse();
    }


    /**
     * 
     * @param bigCanvas 
     * @param x 
     * @param w 
     * @returns a canvas contains only the portion between left x and right x + w
     */
    private static extractFromCanvas(bigCanvas: HTMLCanvasElement, x: number, w: number): HTMLCanvasElement {
        const canvasPage = document.createElement("canvas");
        const h = Layout.getWindowHeight();
        console.log(bigCanvas.height)
        canvasPage.height = h;
        canvasPage.width = w;
        const scaleCorrection = bigCanvas.height / h; //because the html2canvas canvas is of height 1090 instead of 1000. Why?
        canvasPage.getContext("2d").drawImage(bigCanvas, x * scaleCorrection, 0, w * scaleCorrection, h * scaleCorrection, 0, 0, w, h);
        return canvasPage;
    }



    /**
     * 
     * @returns (async) a new canvas containing the current board (with the drawing, the magnets etc.)
     */
    private static getCanvasBoard(): Promise<HTMLCanvasElement> {
        const nodeContent = document.getElementById("content");
        return new Promise((resolve) => { html2canvas(nodeContent).then(canvas => resolve(canvas)) });
    }


    /**
      * @description export the board as a .pdf file
     */
    static async exportPdf(): Promise<void> {
        console.log("export in PDF starting...")

        const severalSlides = BoardManager.timeline.isSeveralSlides();

        console.log(severalSlides ? "there are several slides, it is a presentation. We make one slide on page in the PDF" :
            "there are no slides. We split the board in pieces, there may be several pages.")

        CircularMenu.hideAndRemove();
        Layout.setForExportPng();
        const t = BoardManager.timeline.getCurrentIndex(); //store the current timeline index

        await BoardManager.timeline.setCurrentIndex(0);

        const doc = new jspdf({ orientation: "landscape", unit: "px", format: [Layout.getWindowWidth(), Layout.getWindowHeight()] });
        const blitCanvasPageOnPage = (canvasPage: HTMLCanvasElement) => {
            doc.addImage(canvasPage, 'png', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "", "FAST");
        };

        let firstpage = true;
        const w = Math.max(BoardManager.width, Layout.getWindowWidth());

        while (!BoardManager.timeline.isEnd()) {
            console.log(severalSlides ? "treating next slide..." : "beginning of the process");
            await BoardManager.timeline.nextPausedFrame();
            const canvasFullBoard = await Export.getCanvasBoard();

            if (severalSlides) {
                const canvasPage = Export.extractFromCanvas(canvasFullBoard, 0, w);
                if (!firstpage) doc.addPage();
                blitCanvasPageOnPage(canvasPage);
            }
            else { // we split the board in several pieces
                for (let x = 0; x < BoardManager.width; x += Layout.getWindowWidth()) {
                    if (!firstpage) doc.addPage();
                    const canvasPage = Export.extractFromCanvas(canvasFullBoard, x, Layout.getWindowWidth());
                    blitCanvasPageOnPage(canvasPage);
                    firstpage = false;
                }
            }
            firstpage = false; //for sure it is not the first page because at least one slide has been produced
        }
        //doc.save((<HTMLInputElement>document.getElementById("exportPngName")).value + ".pdf");
        doc.output("pdfobjectnewwindow", { filename: (<HTMLInputElement>document.getElementById("exportPngName")).value + ".pdf" });
        BoardManager.timeline.setCurrentIndex(t); //restore the current timeline index
        Layout.restoreForUse();
    }
}