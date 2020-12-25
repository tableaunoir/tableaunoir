import { Layout } from './Layout';
import * as pdfjsLib from 'pdfjs-dist';

const pdfWorkerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;


export class PDFViewer {

    // The workerSrc property shall be specified.
    pageCanvas: HTMLCanvasElement[] = [];
    pdfDoc = null;
    pageNum = 1;
    pageRendering = false;
    pageNumPending = null;

    getCanvasBackground(): HTMLCanvasElement {
        return <HTMLCanvasElement>document.getElementById("canvasBackground");
    }


    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    renderPage(num) {
        if(this.pageCanvas[num] == undefined) {
            this.pageCanvas[num] = document.createElement("canvas");
            this.pageCanvas[num].classList.add("pdfPage");
            document.getElementById("pdf").appendChild(this.pageCanvas[num]);
        }

        const canvas = this.pageCanvas[num];
        const ctx = canvas.getContext("2d");
        this.pageRendering = true;
        // Using promise to fetch the page
        this.pdfDoc.getPage(num).then((page) => {
            const w = page.getViewport({ scale: 1.0 }).width;
            const h = page.getViewport({ scale: 1.0 }).height;
            const scale = (w/h > Layout.getWindowWidth() /Layout.getWindowHeight()) ? Layout.getWindowWidth() / w : 
            Layout.getWindowHeight() / h ;

            const x = (w/h  > Layout.getWindowWidth() /Layout.getWindowHeight()) ? 0 : (Layout.getWindowWidth() - (w * scale)) / 2;

            const y = (w/h  > Layout.getWindowWidth() /Layout.getWindowHeight()) ? (Layout.getWindowHeight() - (h * scale)) / 2 : 0;

            canvas.style.top = y + "px";
            canvas.style.left = ((num-1)*Layout.getWindowWidth() + x) + "px";
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
            renderTask.promise.then(() => {
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
            document.getElementById("pdf").innerHTML = "";
            for(let i = 1; i <= this.pdfDoc.numPages; i++) {
                this.renderPage(i);
            }
        });
    }



}