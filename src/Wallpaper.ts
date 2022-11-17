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
        document.getElementById("buttonSeyes").onclick = () => {
            Share.execute("backgroundSeyes", []);
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

        const nbgridy = 18;

        const COLORGRID = "rgb(50, 50, 50)";
        const PRESSURE = 0.1;
        const fullHeight = Layout.getWindowHeight();
        const canvas = Wallpaper._createCanvas(fullHeight / nbgridy, fullHeight / nbgridy);

        Drawing.drawLine(canvas.getContext("2d"), 0, 0, 0, canvas.width, PRESSURE, COLORGRID);
        Drawing.drawLine(canvas.getContext("2d"), 0, 0, canvas.width, 0, PRESSURE, COLORGRID);

        Wallpaper.set(canvas.toDataURL());
    }


    static seyes(): void {

        const nbgridy = 18;

        const COLORGRID = "rgba(96, 96, 255, 0.8)";
        const COLORGRID2 = "rgba(128, 168, 192, 0.6)";
        const PRESSURE = 0.2;
        const PRESSURE2 = 0.05;
        const fullHeight = Layout.getWindowHeight();
        const canvas = Wallpaper._createCanvas(fullHeight / nbgridy, fullHeight / nbgridy);
        const ctx = canvas.getContext("2d");

        const h = canvas.height;

        for (const ratio of [0.25, 0.5, 0.75]) {
            const y = ratio * h;
            Drawing.drawLine(ctx, 0, y, canvas.width, y, PRESSURE2, COLORGRID2);
        }
        Drawing.drawLine(canvas.getContext("2d"), 0, 0, 0, canvas.width, PRESSURE, COLORGRID);
        Drawing.drawLine(ctx, 0, 0, canvas.width, 0, PRESSURE, COLORGRID);

        Wallpaper.set(canvas.toDataURL());
    }



    /**
     * @description draw a music score thing as a background
     */
    static musicScore(): void {
        const COLORSTAFF = "rgb(128, 128, 255)";
        const canvas = Wallpaper._createCanvas(2, MUSIC_fullHeight);

        const x = 0;
        const x2 = 2 * Layout.getWindowWidth();

        const drawStaff = (ymiddle) => {
            for (let i = -2; i <= 2; i++) {
                const y = ymiddle + i * MUSIC_space;
                Drawing.drawLine(canvas.getContext("2d"), x, y, x2, y, 1.0, COLORSTAFF);
            }
        }

        drawStaff(MUSIC_ymiddleScreen - MUSIC_yshift);
        drawStaff(MUSIC_ymiddleScreen + MUSIC_yshift);

        Wallpaper.set(canvas.toDataURL());
    }




    /**
     * @param y 
     * @returns the frequency (in Herz) that corresponds to a note at y, with the background being the two music staffs
     */
    static musicScoreYToFrequency(y: number): number {

        /**
         * dy is the vertical position wrt to some C in the current staff
         */
        const dy = y - ((y < MUSIC_ymiddleScreen) ?
            (MUSIC_ymiddleScreen - MUSIC_yshift) + MUSIC_space / 2 //C
            : (MUSIC_ymiddleScreen + MUSIC_yshift)) + 2 * MUSIC_space / 2; //also C

        const i = -dy / MUSIC_space * 2;
        const octave = Math.floor(i / 7);
        const m = (i >= 0) ? i % 7 : 7 + i % 7;
        const ecart = [2, 2, 1, 2, 2, 2, 1];
        const note = [0, 2, 4, 5, 7, 9, 11];

        const a = octave * 12 + note[Math.floor(m)] + (m - Math.floor(m)) * ecart[Math.floor(m)];

        //220 * 2^(-2/12)
        //440 * 2^(3/12)
        const freqmiddle = (y < MUSIC_ymiddleScreen) ? 523.2511 : 195.9977;
        return freqmiddle * Math.pow(2, a / 12);
    }
}


window["musicScoreYToFrequency"] = Wallpaper.musicScoreYToFrequency;


const MUSIC_fullHeight = Layout.getWindowHeight() - 32;
const MUSIC_yshift = MUSIC_fullHeight / 7;
const MUSIC_ymiddleScreen = MUSIC_fullHeight / 2;
const MUSIC_space = MUSIC_fullHeight / 30;