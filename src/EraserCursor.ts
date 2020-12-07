import { ToolEraser } from './ToolEraser';
import { Layout } from './Layout';
import { BlackVSWhiteBoard } from './BlackVSWhiteBoard';


export class EraserCursor {

    /**
    *
    * @param {*} size
    * @returns the .style.cursor of the canvas if you want to have a cursor that looks like an eraser of size size
    */
    static getStyleCursor(size = 20, temperature): { data: string, x: number, y: number } {
        if (size > 128) size = 128;
        return { data: EraserCursor.getCursorURL(size, temperature), x: size / 2, y: size / 2 };
    }

    /**
     *
     * @param size
     * @returns the URL of the image of the cursor
     */
    static getCursorURL(size: number, temperature): string {
        const radius = Math.min(64, size / (Layout.getZoom()));

        const canvas = document.createElement('canvas');
        canvas.width = 2 * radius;
        canvas.height = 2 * radius;
        const ctx = canvas.getContext("2d");

        let borderColor = undefined;
        if (temperature < ToolEraser.temperatureThreshold / 3)
            borderColor = BlackVSWhiteBoard.getBackgroundColor() == "black" ? "white" : "black";
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
