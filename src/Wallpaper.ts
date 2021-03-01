import { Share } from './share';
import { Layout } from './Layout';
import { Drawing } from './Drawing';



export class Wallpaper {
    static init(): void {
        document.getElementById("buttonNoBackground").onclick = () => {
            Share.execute("backgroundClear", []);
        };
        document.getElementById("buttonMusicScore").onclick = () => {
            Share.execute("backgroundMusicScore", []);
        };
        document.getElementById("buttonGrid").onclick = () => {
            Share.execute("backgroundGrid", []);
        };

    }

    /**
     * stores the current img in binary (to be sent later for instance)
     */
    static dataURL: string = undefined;


    /**
     * @returns yes iff there is a background
     */
    static get is(): boolean { return Wallpaper.dataURL != undefined; }

    /**
     * 
     * @param dataURL 
     * @description set the background to be the image described in dataURL
     */
    static set(dataURL: string): void {
        const elBackground = document.getElementById("documentPanel");
        if (dataURL == undefined)
            elBackground.style.backgroundImage = "";
        else elBackground.style.backgroundImage = "url(" + dataURL + ")";

        Wallpaper.dataURL = dataURL;
    }



    static _createCanvas(width: number, height: number): HTMLCanvasElement {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }




    static clear(): void {
        Wallpaper.set(undefined);
    }


    static grid(): void {

        const gridy = 18;

        const COLORGRID = "rgb(50, 50, 50)";
        const PRESSURE = 0.1;
        const fullHeight = Layout.getWindowHeight();
        const canvas = Wallpaper._createCanvas(fullHeight / gridy, fullHeight / gridy);

        Drawing.drawLine(canvas.getContext("2d"), 0, 0, 0, canvas.width, PRESSURE, COLORGRID);
        Drawing.drawLine(canvas.getContext("2d"), 0, 0, canvas.width, 0, PRESSURE, COLORGRID);

        Wallpaper.set(canvas.toDataURL());
    }




    /**
     * @description draw a music score thing as a background
     */
    static musicScore(): void {

        const COLORSTAFF = "rgb(128, 128, 255)";
        const fullHeight = Layout.getWindowHeight() - 32;
        const canvas = Wallpaper._createCanvas(2, fullHeight);

        const x = 0;
        const x2 = 2 * Layout.getWindowWidth();
        const ymiddleScreen = fullHeight / 2;
        const yshift = fullHeight / 7;
        const drawStaff = (ymiddle) => {
            const space = fullHeight / 30;

            for (let i = -2; i <= 2; i++) {
                const y = ymiddle + i * space;
                Drawing.drawLine(canvas.getContext("2d"), x, y, x2, y, 1.0, COLORSTAFF);
            }
        }

        drawStaff(ymiddleScreen - yshift);
        drawStaff(ymiddleScreen + yshift);

        Wallpaper.set(canvas.toDataURL());
    }

}