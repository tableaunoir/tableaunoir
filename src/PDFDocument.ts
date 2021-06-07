import { Layout } from './Layout';
import * as pdfjsLib from 'pdfjs-dist';

const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export class PDFDocument {
    pdfDoc: pdfjsLib.PDFDocumentProxy = null;
    dataURL: string = undefined;

    /**
     * Asynchronously downloads PDF.
     * The promise is resolved when the PDF is loaded
     */
    open(url: string): Promise<void> {
        this.dataURL = url;
        return new Promise((resolve) => {
            pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
                this.pdfDoc = pdfDoc_;
                resolve();
            });
        });
    }

    /**
     * @param num Page number.
     * @returns a canvas containing the image of the page numbered num
     */
    getCanvasPage(num: number): Promise<HTMLCanvasElement> {
        return new Promise((resolve) => {

            const canvas = document.createElement("canvas");
            canvas.classList.add("pdfPage");
            const ctx = canvas.getContext("2d");
            // Using promise to fetch the page
            this.pdfDoc.getPage(num).then((page) => {
                const w = page.getViewport({ scale: 1.0 }).width;
                const h = page.getViewport({ scale: 1.0 }).height;
                const scale = (w / h > Layout.getWindowWidth() / Layout.getWindowHeight()) ? Layout.getWindowWidth() / w :
                    Layout.getWindowHeight() / h;

                const viewport = page.getViewport({ scale: scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                /**const x = (w/h  > Layout.getWindowWidth() /Layout.getWindowHeight()) ? 0 : (Layout.getWindowWidth() - (canvas.width)) / 2;
    
                const y = (w/h  > Layout.getWindowWidth() /Layout.getWindowHeight()) ? (Layout.getWindowHeight() - (canvas.height)) / 2 : 0;*/

                /*  const x = 0;
                  const y = 0;
      
                  canvas.style.top = y + "px";
                  canvas.style.left = ((num-1)*Layout.getWindowWidth() + x) + "px";*/

                // Render PDF page into canvas context
                const renderContext = {
                    canvasContext: ctx,
                    viewport: viewport
                };
                const renderTask = page.render(renderContext);

                // Wait for rendering to finish
                renderTask.promise.then(() => {
                    //this.pageRendering = false;
                    /*if (this.pageNumPending !== null) {
                        // New page rendering is pending
                        this.renderPage(this.pageNumPending);
                        this.pageNumPending = null;
                    }*/
                    resolve(canvas);
                });
            });

        });

    }


    /**
     * @returns the number of pages in the PDF
     */
    get nbPages(): number { return this.pdfDoc.numPages; }

}