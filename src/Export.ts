import { BoardManager } from './boardManager';
import { LoadSave } from './LoadSave';
import { Layout } from './Layout';
import { CircularMenu } from './CircularMenu';
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'
import { getCanvas } from './main';



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
    static exportPng(): void {
        CircularMenu.hideAndRemove();
        const nodeContent = document.getElementById("content");
        Layout.setForExportPng();
        html2canvas(nodeContent).then(bigCanvas => {
            console.log(BoardManager.width);
            const canvas = Export.extractFromCanvas(bigCanvas, 0, BoardManager.width);
            LoadSave.downloadDataURL((<HTMLInputElement>document.getElementById("exportPngName")).value + ".png", canvas.toDataURL());
        });
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
        return new Promise((resolve) => {
            if (document.getElementById("magnets").hasChildNodes())
                html2canvas(nodeContent).then(canvas => resolve(canvas))
            else
                resolve(getCanvas());
        });
    }


    /**
      * @description export the board as a .pdf file
     */
    static async exportPdf(): Promise<void> {
        console.log("export in PDF starting...")
        CircularMenu.hideAndRemove();
        Layout.setForExportPng();

        const severalSlides = BoardManager.timeline.isSeveralSlides();

        console.log(severalSlides ? "there are several slides, it is a presentation. We make one slide on page in the PDF" :
            "there are no slides. We split the board in pieces, there may be several pages.")

        const t = BoardManager.timeline.getCurrentIndex();
        await BoardManager.timeline.setCurrentIndex(0);

        console.log("the width of the board is: " + BoardManager.width);
        const doc = severalSlides ? new jspdf('l', 'px', [BoardManager.width, 1000]) : new jspdf('l');
        let firstpage = true;

        while (!BoardManager.timeline.isEnd()) {
            console.log(severalSlides ? "treating next slide..." : "beginning of the process");
            await BoardManager.timeline.nextPausedFrame();
            const canvas = await Export.getCanvasBoard();

            if (severalSlides) {
                if (!firstpage)
                    doc.addPage();

                const pw = doc.internal.pageSize.getWidth();
                const ph = doc.internal.pageSize.getHeight();
                const h = canvas.height;
                const w = canvas.width;
                doc.addImage(canvas, 'png', 0, 0, ph * w / h, ph);
            }
            else { // we split the board in several pieces

                for (let x = 0; x < BoardManager.width; x += Layout.getWindowWidth()) {
                    if (!firstpage)
                        doc.addPage();
                    const canvasPage = Export.extractFromCanvas(canvas, x, Layout.getWindowWidth());

                    const pw = doc.internal.pageSize.getWidth();
                    const ph = doc.internal.pageSize.getHeight();
                    const h = canvasPage.height;
                    const w = canvasPage.width;

                    if (w / h > pw / ph)
                        doc.addImage(canvasPage, 'png', 0, 0, pw, pw * h / w);
                    else
                        doc.addImage(canvasPage, 'png', 0, 0, ph * w / h, ph);

                    firstpage = false;

                }


            }
            firstpage = false; //for sure it is not the first page because at least one slide has been produced
        }
        doc.save((<HTMLInputElement>document.getElementById("exportPngName")).value + ".pdf");
        BoardManager.timeline.setCurrentIndex(t);
        Layout.restoreForUse();
    }


}