import { ChalkCursor } from './ChalkCursor';
import { ToolEraser } from './ToolEraser';
import { Layout } from './Layout';


const CANVASSIZE = 128;


export class EraserCursor {

    /**
    *
    * @param {*} lineWidth
    * @returns the .style.cursor of the canvas if you want to have a cursor that looks like an eraser of size size
    */
    static getStyleCursor(lineWidth: number, temperature: number): { data: string, x: number, y: number } {
        const radius = EraserCursor.getRadius(lineWidth);
        return { data: EraserCursor.getCursorURL(radius, temperature), x: CANVASSIZE / 2, y: CANVASSIZE / 2 };
    }


    static getRadius(lineWidth: number): number {
        const MINRADIUS = 3;
        const MAXRADIUS = 64; // otherwise the cursor does not appear anymore
        return Math.max(MINRADIUS, Math.min(MAXRADIUS, lineWidth / (2 * Layout.getZoom())));
    }




    /**
     * 
     * @param temperature 
     * @returns the color corresponding to the temperature
     */
    public static temperatureToColor(temperature: number): string {

        function hexaToNumber(hexa: string): number {
            return parseInt(hexa, 16);
        }

        function colorStrToArray(c: string) {
            return [c.substr(1, 2), c.substr(3, 2), c.substr(5, 2)].map(hexaToNumber);
        }

        function mix(c1: string, c2: string, ratio: number): string {
            const ac1 = colorStrToArray(c1);
            const ac2 = colorStrToArray(c2);
            const result = [0, 0, 0];
            for (const i in result)
                result[i] = ac1[i] * (1 - ratio) + ac2[i] * ratio;

            return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
        }

        const colors = ["#9999FF", "#00AA00", "#88FF00", "#FFFF00", "#FFAA00", "#EE0000", "#CC0000", "#AA0000", "#FFFFFF"];
        //blue because it is really rare to have a document with a blue background (white or black is not good)
        const r = (colors.length - 1) * temperature / ToolEraser.temperatureThreshold;
        const i = Math.max(0, Math.floor((colors.length - 1) * temperature / ToolEraser.temperatureThreshold));
        if (i >= colors.length - 1)
            return colors[i];

        console.log(i, colors.length);
        return mix(colors[i], colors[i + 1], r - i);
    }







    private static drawEraserBody(context, radius, temperature) {
        const sizeX = 26;
        const sizeY = 32;
        const distEraserCenterHandle = radius + 5;
        const handleWidth = 24;//Math.min(radius*0.9, 8);
        const length = 48;


        if (ChalkCursor.leftHanded) //transformation for left-handed
            context.transform(-1, 0, 0, 1, CANVASSIZE, 0);

        const angle = Math.atan2(sizeY, sizeX);

        const p1 = {
            x: CANVASSIZE / 2 + distEraserCenterHandle * Math.cos(angle),
            y: CANVASSIZE / 2 + distEraserCenterHandle * Math.cos(angle)
        };
        const p2 = {
            x: CANVASSIZE / 2 + distEraserCenterHandle * Math.cos(angle) + handleWidth * Math.sin(angle),
            y: CANVASSIZE / 2 + distEraserCenterHandle * Math.sin(angle) - handleWidth * Math.cos(angle)
        };
        const ll = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

        context.beginPath();
        context.moveTo(p1.x, p1.y);
        context.lineTo(p1.x + ll.x, p1.y + ll.y);
        context.lineTo(p2.x + ll.x, p2.y + ll.y);
        context.lineTo(p2.x, p2.y);
        context.lineTo(p1.x, p1.y);
        context.lineWidth = 3;
        context.strokeStyle = "gray"; //the border of the eraser should be visible
        context.stroke();
        context.fillStyle = "rgba(242, 242,242, 0.8)";
        context.fill();


        const r = 0.5;
        const height = 0.5;
        context.beginPath();
        context.moveTo(p1.x + r * ll.x, p1.y + r * ll.y);
        context.lineTo(p1.x + (r + height) * ll.x, p1.y + (r + height) * ll.y);
        context.lineTo(p2.x + (r + height) * ll.x, p2.y + (r + height) * ll.y);
        context.lineTo(p2.x + r * ll.x, p2.y + r * ll.y);
        context.lineTo(p1.x + r * ll.x, p1.y + r * ll.y);
        context.lineWidth = 1;
        context.strokeStyle = "black";
        context.stroke();
        context.fillStyle = EraserCursor.temperatureToColor(temperature);
        context.fill();

    }
    /**
     *
     * @param size
     * @returns the URL of the image of the cursor
     */
    static getCursorURL(radius: number, temperature: number): string {
        const canvas = document.createElement('canvas');
        canvas.width = CANVASSIZE;
        canvas.height = CANVASSIZE;
        const context = canvas.getContext("2d");

        const borderColor = EraserCursor.temperatureToColor(temperature);

        if (radius < 32)
            EraserCursor.drawEraserBody(context, radius, temperature);


        context.globalCompositeOperation = "destination-out";
        context.beginPath();
        context.arc(CANVASSIZE / 2, CANVASSIZE / 2, radius, 0, 2 * Math.PI);
        context.strokeStyle = borderColor;
        context.fillStyle = "rgba(128,128, 128, 1)";
        context.fill();

        context.globalCompositeOperation = "source-over";
        context.beginPath();
        context.arc(CANVASSIZE / 2, CANVASSIZE / 2, radius, 0, 2 * Math.PI);
        context.strokeStyle = borderColor;
        context.lineWidth = (radius < 16) ? 1 : 2;//Math.max(1, 2 * temperature / ToolEraser.temperatureThreshold);
        context.stroke();
        context.fillStyle = "rgba(128,128, 128, 0.1)";
        context.fill();
        return canvas.toDataURL();
    }
}
