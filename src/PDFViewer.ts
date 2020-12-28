export class PDFViewer {
    static get numPage(): number {
        return parseInt((<HTMLInputElement> document.getElementById("pdfNumPage")).value);
    }
}