import { BoardManager } from './boardManager';
import { LoadSave } from './LoadSave';
import { Layout } from './Layout';
import { CircularMenu } from './CircularMenu';
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'



export class Export {
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
      * @description export the board as a .png image file
     */
    static exportPdf(): void {
        CircularMenu.hideAndRemove();
        const nodeContent = document.getElementById("content");
        Layout.setForExportPng();
        html2canvas(nodeContent).then(canvas => {
            const doc = new jspdf('l');
            let firstpage = true;
            for (let x = 0; x < BoardManager.width; x += Layout.getWindowWidth()) {
                if (!firstpage)
                    doc.addPage();
                const canvasPage = Export.extractFromCanvas(canvas, x, Layout.getWindowWidth());

                const pw = doc.internal.pageSize.getWidth();
                const ph = doc.internal.pageSize.getHeight();
                const h = canvasPage.height;
                const w = canvasPage.width;

                if (w / h > pw / ph)
                    doc.addImage(canvasPage, 0, 0, pw, pw * h / w);
                else
                    doc.addImage(canvasPage, 0, 0, ph * w / h, ph);


                firstpage = false;
            }
            doc.save((<HTMLInputElement>document.getElementById("exportPngName")).value + ".pdf");
        });
        Layout.restoreForUse();
    }


}