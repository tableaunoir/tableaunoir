import { ToolEraser } from './ToolEraser';
import { Layout } from './Layout';
import { BlackVSWhiteBoard } from './BlackVSWhiteBoard';


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

        let borderColor = undefined;
        if (temperature < ToolEraser.temperatureThreshold / 3)
            borderColor = "0x4444FF"; //blue because it is really rare to have a document with a blue background (white or black is not good)
        else if (temperature < 2 * ToolEraser.temperatureThreshold / 3)
            borderColor = "orange";
        else
            borderColor = "red";

        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 5 * temperature / ToolEraser.temperatureThreshold;
        ctx.stroke();
        ctx.fillStyle = BlackVSWhiteBoard.getBackgroundColor() == "black" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
        ctx.fill();
        return canvas.toDataURL();
    }
}
