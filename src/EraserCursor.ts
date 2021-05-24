import { ToolEraser } from './ToolEraser';
import { Layout } from './Layout';
import { BackgroundTexture } from './BackgroundTexture';


export class EraserCursor {

    /**
    *
    * @param {*} lineWidth
    * @returns the .style.cursor of the canvas if you want to have a cursor that looks like an eraser of size size
    */
    static getStyleCursor(lineWidth: number, temperature: number): { data: string, x: number, y: number } {
        const radius = EraserCursor.getRadius(lineWidth);
        return { data: EraserCursor.getCursorURL(radius, temperature), x: lineWidth / 2, y: lineWidth / 2 };
    }


    static getRadius(lineWidth: number): number {
        const MINRADIUS = 3;
        const MAXRADIUS = 64; // otherwise the cursor does not appear anymore
        return Math.max(MINRADIUS, Math.min(MAXRADIUS, lineWidth / (2*Layout.getZoom())));
    }





    private static temperatureToColor(temperature: number): string {
        const colors = ["#9999FF", "#88FF00", "#FFFF00","#FFAA00", "#FF8800", "#FF4400", "#EE0000"];
        //blue because it is really rare to have a document with a blue background (white or black is not good)
        const i  = Math.round((colors.length-1)*temperature / ToolEraser.temperatureThreshold);
        return colors[i];
    }

    /**
     *
     * @param size
     * @returns the URL of the image of the cursor
     */
    static getCursorURL(radius: number, temperature: number): string {
        const canvas = document.createElement('canvas');
        canvas.width = 2 * radius;
        canvas.height = 2 * radius;
        const ctx = canvas.getContext("2d");

        const borderColor = EraserCursor.temperatureToColor(temperature);

        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = Math.max(1, 2 * temperature / ToolEraser.temperatureThreshold);
        ctx.stroke();
        ctx.fillStyle = "rgba(128,128, 128, 0.1)";
        ctx.fill();
        return canvas.toDataURL();
    }
}
    