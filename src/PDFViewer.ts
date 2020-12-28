import { PDFDocument } from './PDFDocument';

export class PDFViewer {

    constructor(pdfdoc: PDFDocument) {
        const f = async () => {
            const i = this.numPage;
            const canvas = await pdfdoc.getCanvasPage(i);
            canvas.style.height = "300px";
            canvas.style.position = "relative"; //for the canvas to "take place"
            document.getElementById("pdfSnapshot").innerHTML = "";
            document.getElementById("pdfSnapshot").appendChild(canvas);
        };
        this.inputPDFNumPage.onchange = f;
        this.inputPDFNumPage.value = "1";
        f();
    }

    get numPage(): number {
        return parseInt(this.inputPDFNumPage.value);
    }


    get inputPDFNumPage(): HTMLInputElement {
        return <HTMLInputElement>document.getElementById("pdfNumPage");
    }
}