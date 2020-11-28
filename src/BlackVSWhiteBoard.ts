import { getCanvas, palette } from './main';
import { CSSStyleModifier } from './CSSStyleModifier';

/**
 * This class implements the switch between whiteboard and blackboard
 */
export class BlackVSWhiteBoard {

    static init(): void {
        document.getElementById("content").style.backgroundColor = "black";
        BlackVSWhiteBoard.switchTo("black");
        //document.getElementById("canvasBackground").style.backgroundColor = "black";
        document.getElementById("whiteBoardSwitch").onclick = () => BlackVSWhiteBoard.switchTo("white");
        document.getElementById("blackBoardSwitch").onclick = () => BlackVSWhiteBoard.switchTo("black");
    }


    /**
     * @param backgroundColor, can be "white" or "black"
     * @description set the background color to the color backgroundColor
     */
    static switchTo(backgroundColor: "white" | "black"): void {
        const previousBackgroundColor = document.getElementById("content").style.backgroundColor;
        document.getElementById(backgroundColor + "BoardSwitch").classList.add("buttonselected");
        document.getElementById("backgroundSnapshotBackgroundColor").style.backgroundColor = backgroundColor;
        if (previousBackgroundColor == backgroundColor)
            return;
        //const backgroundColor = previousBackgroundColor == "white" ? "black" : "white";

        document.getElementById(previousBackgroundColor + "BoardSwitch").classList.remove("buttonselected");


        console.log("previous background color was " + previousBackgroundColor);
        console.log("switch to " + backgroundColor + "board")
        palette.switchBlackAndWhite();
        document.getElementById("content").style.backgroundColor = backgroundColor;

        if (backgroundColor == "black") {
            CSSStyleModifier.setRule(".magnetText div", "background-color", "rgba(27, 27, 27, 0.9)");
            CSSStyleModifier.setRule("div.magnetText", "background-color", "rgba(64, 64, 64, 0.9)");
            CSSStyleModifier.setRule(".magnetText div", "color", "white");
        }
        else {
            CSSStyleModifier.setRule(".magnetText div", "background-color", "rgba(247, 247, 247, 0.9)");
            CSSStyleModifier.setRule("div.magnetText", "background-color", "rgba(227, 227, 227, 0.9)");
            CSSStyleModifier.setRule(".magnetText div", "color", "black");
        }

        BlackVSWhiteBoard._invertCanvas();
    }


    /**
     * @dsecription invert the colors of the canvas (black becomes white, white becomes black, red becomes...)
     */
    static _invertCanvas(): void {
        const canvas = getCanvas();
        const context = canvas.getContext('2d');

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // red
            data[i] = 255 - data[i];
            // green
            data[i + 1] = 255 - data[i + 1];
            // blue
            data[i + 2] = 255 - data[i + 2];
        }

        // overwrite original image
        context.putImageData(imageData, 0, 0);
    }


    /**
     * @returns "black" if it is a blackboard
     *          "white" if it is a whiteboard
     */
    static getBackgroundColor(): string {
        return document.getElementById("content").style.backgroundColor;
    }

    /**
     * @returns the default chalk color, "white" if it is a blackboard
     *                                   "black" if it is a whiteboard
     */
    static getDefaultChalkColor(): string {
        return BlackVSWhiteBoard.getBackgroundColor() == "white" ? "black" : "white";
    }

}


