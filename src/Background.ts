import { PDFViewer } from './PDFViewer';
import { PDFDocument } from './PDFDocument';
import { Share } from './share';
import { getCanvasBackground } from './main';
import { Layout } from './Layout';
import { LoadSave } from './LoadSave';
import { Drawing } from './Drawing'


/**
 * this class is for the background (image) to be added behind your board
 */
export class Background {

    static pdfdoc: PDFDocument = undefined; // current pdf document loaded
    static pdfviewer: PDFViewer = undefined;


    static async setPDF(dataURL: string): Promise<void> {
        Background.pdfdoc = new PDFDocument();
        await Background.pdfdoc.open(dataURL);
        (<HTMLInputElement>document.getElementById("pdfNumPage")).max = "" + Background.pdfdoc.nbPages;
        Background.pdfviewer = new PDFViewer(Background.pdfdoc);
    }


    static async getDataURLPDFPageToInsert(pagenum: number): Promise<string> {
        const canvas = await Background.pdfdoc.getCanvasPage(pagenum);
        return canvas.toDataURL();
    }

    /**
     * initialize the interface
     */
    static init(): void {
      
        document.getElementById("buttonNoImageBackground").onclick = () => {
            Share.execute("documentsRemoveAll", []);
        };

    
        (<HTMLInputElement>document.getElementById("inputBackground")).onchange = function (evt) {
            const file = (<HTMLInputElement>evt.target).files[0];
            const funcInsertDocImg = (dataURL) => Share.execute("insertDocumentImage", [dataURL, Layout.getWindowLeft()]);

            if (file.name.endsWith(".pdf")) {
                LoadSave.fetchFromFile(file, (dataURL) => Background.setPDF(dataURL));

                document.getElementById("buttonPDFInsertPage").onclick = () => {
                    Background.getDataURLPDFPageToInsert(Background.pdfviewer.numPage).then(funcInsertDocImg);
                };

                document.getElementById("forpdf").hidden = false;
            }
            else {
                LoadSave.fetchFromFile(file, funcInsertDocImg);
                document.getElementById("forpdf").hidden = true;
            }

        }
    }


    

    static getDocumentPanel(): HTMLElement {
        return document.getElementById("documentPanel");
    }

}
