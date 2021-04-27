import { Share } from './share';
import { GUIActions } from './GUIActions';
import { getCanvas } from './main';
import { CSSStyleModifier } from './CSSStyleModifier';

/**
 * 
 * This class implements the switch between whiteboard and blackboard
 */
export class BackgroundTexture {

    static currentBackgroundTexture = "black";

    static init(): void {
        const backgroundCustomColor = document.getElementById("backgroundCustomColor");

        const checkboxBackgroundGradient = <HTMLInputElement>document.getElementById("checkboxBackgroundGradient");
        const inputBackgroundColor = <HTMLInputElement>document.getElementById("inputBackgroundColor");
        const inputBackgroundColor2 = <HTMLInputElement>document.getElementById("inputBackgroundColor2");

        const updateCustomColor = () => {
            backgroundCustomColor.hidden = false;
            const texture = checkboxBackgroundGradient.checked ?
                `linear-gradient(${inputBackgroundColor.value}, ${inputBackgroundColor2.value})` : inputBackgroundColor.value;
            Share.execute("setBackgroundColor", [texture]);
        }
        checkboxBackgroundGradient.oninput = () => {
            document.getElementById("backgroundIfGradient").hidden = !checkboxBackgroundGradient.checked;
            updateCustomColor();
        };

        inputBackgroundColor.oninput = updateCustomColor;
        inputBackgroundColor2.oninput = updateCustomColor;

        checkboxBackgroundGradient.checked = false;
        backgroundCustomColor.hidden = true;
        document.getElementById("content").style.background = "black";
        BackgroundTexture.switchTo("black");
        document.getElementById("whiteBoardSwitch").onclick = () => {
            backgroundCustomColor.hidden = true;
            Share.execute("setBackgroundColor", ["white"]);
        }
        document.getElementById("blackBoardSwitch").onclick = () => {
            backgroundCustomColor.hidden = true;
            Share.execute("setBackgroundColor", ["black"]);
        }
        document.getElementById("customBoardSwitch").onclick = updateCustomColor;

    }


    /**
     * @param backgroundTexture, can be "white" or "black"
     * @description set the background color to the color backgroundColor
     */
    static switchTo(backgroundTexture: string): void {
        const previousBackgroundColor = BackgroundTexture.currentBackgroundTexture;
        BackgroundTexture.currentBackgroundTexture = backgroundTexture;
        console.log("previous background color was " + previousBackgroundColor);
        console.log("switch to " + backgroundTexture + "board")

        if (document.getElementById(backgroundTexture + "BoardSwitch"))
            document.getElementById(backgroundTexture + "BoardSwitch").classList.add("buttonselected");
        document.getElementById("backgroundSnapshotBackgroundColor").style.background = backgroundTexture;
        if (previousBackgroundColor == backgroundTexture)
            return;


        if (document.getElementById(previousBackgroundColor + "BoardSwitch"))
            document.getElementById(previousBackgroundColor + "BoardSwitch").classList.remove("buttonselected");


        GUIActions.palette.switchBlackAndWhite();
        document.getElementById("content").style.background = backgroundTexture;

        if (backgroundTexture == "black") {
            CSSStyleModifier.setRule(".magnetText div", "background-color", "rgba(16, 16, 16, 0.9)");
            CSSStyleModifier.setRule("div.magnetText", "background-color", "rgba(32, 32, 32, 0.9)");
            CSSStyleModifier.setRule("img.magnet", "background-color", "rgba(32, 32, 32, 0.9)");
            CSSStyleModifier.setRule(".magnetText div", "color", "white");
        }
        else {
            CSSStyleModifier.setRule(".magnetText div", "background-color", "rgba(247, 247, 247, 0.9)");
            CSSStyleModifier.setRule("img.magnet", "background-color", "rgba(227, 227, 227, 0.9)");
            CSSStyleModifier.setRule("div.magnetText", "background-color", "rgba(227, 227, 227, 0.9)");
            CSSStyleModifier.setRule(".magnetText div", "color", "black");
        }

        //BlackVSWhiteBoard._invertCanvas();
    }




    /**
     * @returns "black" if it is a blackboard
     *          "white" if it is a whiteboard
     */
    static getBackgroundTexture(): string {
        return document.getElementById("content").style.background;
    }

    /**
     * @returns the default chalk color, "white" if it is a blackboard
     *                                   "black" if it is a whiteboard
     */
    static getDefaultChalkColor(): string {
        return BackgroundTexture.getBackgroundTexture() == "white" ? "black" : "white";
    }

}


