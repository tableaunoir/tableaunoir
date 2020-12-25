import { Layout } from './Layout';
import * as pdfjsLib from 'pdfjs-dist';

const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;


export class PDFViewer {

    // The workerSrc property shall be specified.


    pdfDoc = null;
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;
    scale = 0.8;

    getCanvasBackground(): HTMLCanvasElement {
        return <HTMLCanvasElement>document.getElementById("canvasBackground");
    }


    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    renderPage(num) {
        const canvas = this.getCanvasBackground();
        const ctx = canvas.getContext("2d");
        const scale = 0.8;
        this.pageRendering = true;
        // Using promise to fetch the page
        this.pdfDoc.getPage(num).then((page) => {
            const scale= Layout.getWindowHeight() / page.getViewport({scale:1.0}).height;
            console.log(scale)
            var viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            var renderTask = page.render(renderContext);

            // Wait for rendering to finish
            renderTask.promise.then( () => {
                this.pageRendering = false;
                if (this.pageNumPending !== null) {
                    // New page rendering is pending
                    this.renderPage(this.pageNumPending);
                    this.pageNumPending = null;
                }
            });
        });

    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    /**
     * Displays previous page.
     */
    onPrevPage() {
        if (this.pageNum <= 1) {
            return;
        }
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }


    /**
     * Displays next page.
     */
    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) {
            return;
        }
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }

    /**
     * Asynchronously downloads PDF.
     */
    open(url) {
        pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
            this.pdfDoc = pdfDoc_;
    
            // Initial/first page rendering
            this.renderPage(this.pageNum);
        });
    }
 


}