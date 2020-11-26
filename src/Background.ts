import { Share } from './share';
import { BoardManager } from './boardManager';
import { getCanvasBackground } from './main';
import { Layout } from './Layout';
import { LoadSave } from './LoadSave';
import { Menu } from './Menu';
import { Drawing } from './Drawing'

export class Background {

    static dataURL = undefined;

    static get is(): boolean {
        return Background.dataURL != undefined;
    }

    static init(): void {
        document.getElementById("buttonNoBackground").onclick = () => {
            Share.execute("backgroundClear", []); Menu.hide();
        };
        document.getElementById("buttonMusicScore").onclick = () => { 
            Share.execute("backgroundMusicScore", []); 
            Menu.hide(); };

        /*  (<HTMLInputElement> document.getElementById("inputBackground")).onchange = function (evt) {
              LoadSave.fetchImageFromFile((<HTMLInputElement> evt.target).files[0],
                  (img) => {
                      Background.clear();
                      const canvasBackground = getCanvasBackground();
                      const height = Layout.getWindowHeight();
                      const scaleWidth = img.width * height / img.height;
                      const x = (Layout.getWindowWidth() - scaleWidth) / 2;
                      console.log(img)
                      canvasBackground.getContext("2d").drawImage(img, x, 0, scaleWidth, height);
                  });
  
          };
  */

        (<HTMLInputElement>document.getElementById("inputBackground")).onchange = function (evt) {
            LoadSave.fetchFromFile((<HTMLInputElement>evt.target).files[0],
                (dataURL) => Share.execute("setBackground", [dataURL]));
        }
    }


    static set(dataURL): void {
        const img = new Image();
        Background.dataURL = dataURL;
        img.src = dataURL;
        Background.clear();
        const canvasBackground = getCanvasBackground();
        const height = Layout.getWindowHeight();
        const scaleWidth = img.width * height / img.height;
        //const x = (Layout.getWindowWidth() - scaleWidth) / 2;
        const x = 0;
        console.log(img)
        canvasBackground.getContext("2d").drawImage(img, x, 0, scaleWidth, height);
    }



    static clear(): void {
        const canvasBackground = getCanvasBackground();
        this.dataURL = undefined;
        canvasBackground.getContext("2d").clearRect(0, 0, canvasBackground.width, canvasBackground.height);
    }


    static musicScore(): void {
        Background.clear();
        const COLORSTAFF = "rgb(128, 128, 255)";
        const fullHeight = Layout.getWindowHeight() - 32;
        const canvasBackground = getCanvasBackground();

        const x = 0;
        const x2 = 2 * Layout.getWindowWidth();
        const ymiddleScreen = fullHeight / 2;
        const yshift = fullHeight / 7;
        const drawStaff = (ymiddle) => {
            const space = fullHeight / 30;

            for (let i = -2; i <= 2; i++) {
                const y = ymiddle + i * space;
                Drawing.drawLine(canvasBackground.getContext("2d"), x, y, x2, y, 1.0, COLORSTAFF);
            }
        }

        drawStaff(ymiddleScreen - yshift);
        drawStaff(ymiddleScreen + yshift);

        BoardManager.saveCurrentScreen();

        Background.dataURL = canvasBackground.toDataURL();
    }

}
