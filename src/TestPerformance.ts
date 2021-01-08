import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { ActionFreeDraw } from './ActionFreeDraw';
import { Drawing } from "./Drawing";
import { getCanvas } from "./main";
import { ToolDraw } from "./ToolDraw";

export class TestPerformance {

    static init() {
        window["TestPerformance"] = TestPerformance;
    }

    static testSVG() {
        for (let x = 0; x < 500; x += 4)
            for (let y = 0; y < 1000; y += 4) {
                const svgLine = ToolDraw.addSVGLine(x, y, x + 2, y + 1, 0.5, "yellow");
                document.getElementById("svg").appendChild(svgLine);
            }

    }

    static testCanvas() {
        for (let x = 0; x < 500; x += 4)
            for (let y = 0; y < 1000; y += 4) {
                Drawing.drawLine(getCanvas().getContext("2d"), x, y, x + 2, y + 1, 0.5, "yellow");
            }

    }




    static testBigCanvas() {
        const w = 32000;
        const h = 1000;
        const S = 40;
        let nbObject = 0;
        getCanvas().width = w;
        for (let x = 0; x < w; x += S) {
            for (let y = 0; y < h; y += S) {
                const action = new ActionFreeDraw(UserManager.me.userID);
                action.addPoint({ x: x, y: y, pressure: 1, color: randomColor() });
                action.addPoint({ x: x + S * Math.random(), y: y + S * Math.random(), pressure: 1, color: randomColor() });
                action.redo();
                BoardManager.addAction(action);
                nbObject++;
            }
        }
        console.log(nbObject + " objects");

    }


}



function randomColor(): string {
    if (Math.random() < 0.2)
        return "orange";
    if (Math.random() < 0.2)
        return "blue";
    return "white";
}