import { BoardManager } from './boardManager';
import { LoadSave } from './LoadSave';
import { Layout } from './Layout';
import { CircularMenu } from './CircularMenu';
import html2canvas from 'html2canvas'
import jspdf from 'jspdf'
import { ActionFreeDraw } from './ActionFreeDraw';
import { ClipBoardManager } from './ClipBoardManager';
import { ShowMessage } from './ShowMessage';


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
        document.getElementById("exportTikz").onclick = () => {
            const exportCode = <HTMLTextAreaElement>document.getElementById("exportCode");
            exportCode.hidden = false;
            const code = Export.getTikzCode();
            exportCode.value = code;
            ClipBoardManager.copy(code, "tikz code");
        };
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

        /** hack for the magnet with LaTEX to appear correctly on the exported canvas: put opacity to 0 for the
         * mjx-assistive-mml elements. Warning: changing display to none is not working because you have a !important
         * in the CSS for mjx-assistive-mml
         */
        const C = document.getElementsByTagName("mjx-assistive-mml");
        for (let i = 0; i < C.length; i++) {
            (<HTMLElement>C[i]).style.opacity = "0.0";
        }

        const nodeContent = document.getElementById("content");
        return new Promise((resolve) => { html2canvas(nodeContent).then(canvas => resolve(canvas)) });
    }


    /**
     * @description export the board as TikZ code in order to put your image in a LaTEX document
     */
    static getTikzCode(): string {
        let code = "\\begin{tikzpicture}[scale=1]\n";
        const f = 0.01;
        const round = (x: number) => Math.round(100 * x) / 100;
        for (const action of BoardManager.timeline.actions) {
            if (action instanceof ActionFreeDraw) {
                const color = action.getMainColor();
                const style = color == "white" ? "" : `[${color}]`;
                code += "\\draw" + style + " " + action.points.map(p => `(${round(p.x * f)}, ${round(-p.y * f)})`).join("--") + ";\n";
            }
        }
        code += "\\end{tikzpicture}";
        return code;
    }

    /**
      * @description export the board as a .pdf file
     */
    static async exportPdf(): Promise<void> {
        console.log("export in PDF starting...")

        const severalSlides = BoardManager.timeline.isSeveralSlides();

        ShowMessage.show(severalSlides ? "pdf export: there are several slides, it is a presentation. We make one slide on page in the PDF" :
            "pdf export: there are no slides. We split the board in pieces, there may be several pages.")

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

        let islide = 1;
        while (!BoardManager.timeline.isEnd()) {
            if (severalSlides)
                ShowMessage.show(`pdf export: treating slide n. ${islide}`);
            console.log(severalSlides ? "treating next slide..." : "pdf export: beginning of the process");
            await BoardManager.timeline.nextPausedFrame();
            const canvasFullBoard = await Export.getCanvasBoard();

            if (severalSlides) {
                const canvasPage = Export.extractFromCanvas(canvasFullBoard, 0, w);
                if (!firstpage) doc.addPage();
                blitCanvasPageOnPage(canvasPage);
            }
            else { // we split the board in several pieces
                const nbPanels = Math.floor(BoardManager.width / (2 * Layout.getWindowWidth()));
                for (let x = 0; x < BoardManager.width; x += Layout.getWindowWidth()) {
                    const iPanel = Math.floor(x / Layout.getWindowWidth()) + 1;
                    ShowMessage.show(`pdf export: treating panels n° ${iPanel} and ${iPanel + 1}}/${nbPanels}`)
                    if (!firstpage)
                        doc.addPage();
                    const canvasPage = Export.extractFromCanvas(canvasFullBoard, x, Layout.getWindowWidth());
                    blitCanvasPageOnPage(canvasPage);
                    firstpage = false;
                }
            }
            firstpage = false; //for sure it is not the first page because at least one slide has been produced
            islide++;
        }
        //doc.save((<HTMLInputElement>document.getElementById("exportPngName")).value + ".pdf");
        doc.output("pdfobjectnewwindow", { filename: (<HTMLInputElement>document.getElementById("exportPngName")).value + ".pdf" });
        BoardManager.timeline.setCurrentIndex(t); //restore the current timeline index
        Layout.restoreForUse();
    }
}