import { BoardManager } from './boardManager';
import { getCanvasBackground } from './main';
import { Layout } from './Layout';
import { LoadSave } from './LoadSave';
import { Menu } from './Menu';
import { Drawing } from './Drawing'

export class Background {
    static init(): void {
        document.getElementById("buttonNoBackground").onclick = () => { Background.clear(); Menu.hide(); };
        document.getElementById("buttonMusicScore").onclick = () => { Background.musicScore(); Menu.hide(); };

        document.getElementById("inputBackground").onchange = function () {
            LoadSave.fetchImageFromFile((<any>this).files[0],
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

    }
    static clear() {
        const canvasBackground = getCanvasBackground();
        canvasBackground.getContext("2d").clearRect(0, 0, canvasBackground.width, canvasBackground.height);
    }


    static musicScore() {
        Background.clear();
        const COLORSTAFF = "rgb(128, 128, 255)";
        const fullHeight = Layout.getWindowHeight() - 32;
        const canvasBackground = getCanvasBackground();

        const x = 0;
        const x2 = 2*Layout.getWindowWidth();
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
    }

}
