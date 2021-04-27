import { PDFViewer } from './PDFViewer';
import { PDFDocument } from './PDFDocument';
import { Share } from './share';
import { Layout } from './Layout';
import { LoadSave } from './LoadSave';


/**
 * this class is for the background (image) to be added behind your board
 */
export class BackgroundDocuments {

    static pdfdoc: PDFDocument = undefined; // current pdf document loaded
    static pdfviewer: PDFViewer = undefined;


    static async setPDF(dataURL: string): Promise<void> {
        BackgroundDocuments.pdfdoc = new PDFDocument();
        await BackgroundDocuments.pdfdoc.open(dataURL);
        (<HTMLInputElement>document.getElementById("pdfNumPage")).max = "" + BackgroundDocuments.pdfdoc.nbPages;
        BackgroundDocuments.pdfviewer = new PDFViewer(BackgroundDocuments.pdfdoc);
    }


    static async getDataURLPDFPageToInsert(pagenum: number): Promise<string> {
        const canvas = await BackgroundDocuments.pdfdoc.getCanvasPage(pagenum);
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
                LoadSave.fetchFromFile(file, (dataURL) => BackgroundDocuments.setPDF(dataURL));

                document.getElementById("buttonPDFInsertPage").onclick = () => {
                    BackgroundDocuments.getDataURLPDFPageToInsert(BackgroundDocuments.pdfviewer.numPage).then(funcInsertDocImg);
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
