import { Share } from './share';
import Color from 'color';
import { UserManager } from './UserManager';


/**
 * 
 * This class implements the background texture.
 * The background can be black (for a blackboard), or white for a whiteboard
 * But it can technicallybe of any color, or actually any CSS style
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


        const params = (new URL(document.location.href)).searchParams;
        if (params.get("bg") != null && params.get("id") == null)
            /**
             * if the parameter "bg" is defined, then it gives the color (or texture) of the background
             * Note that this parameter is ignored when accessing a shared board (i.e. when the parameter id is defined) because the background color
             * is defined in the board itself 
             */
            BackgroundTexture.switchTo(params.get("bg"));
        else
            BackgroundTexture.switchTo("black");

        const onButtonColorBoardSwitch = (color: string) => () => {
            backgroundCustomColor.hidden = true;
            Share.execute("setBackgroundColor", [color]);
        }

        document.getElementById("whiteBoardSwitch").onclick = onButtonColorBoardSwitch("white");
        document.getElementById("blackBoardSwitch").onclick = onButtonColorBoardSwitch("black");
        document.getElementById("greenBoardSwitch").onclick = onButtonColorBoardSwitch("darkgreen");
        document.getElementById("customBoardSwitch").onclick = updateCustomColor;

    }


    /**
     * @param backgroundTexture, can be "white" or "black", or any CSS background expression
     * @description set the background to backgroundTexture
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

        if (backgroundTexture == "white" && UserManager.me.color == "white")
            Share.execute("setCurrentColor", [UserManager.me.userID, "black"]);
        else if (backgroundTexture == "black" && UserManager.me.color == "black")
            Share.execute("setCurrentColor", [UserManager.me.userID, "white"]);

        //        ShareEvent.setCurrentColor(UserManager.me.userID, "red");

        // GUIActions.palette.switchBlackAndWhite();




        document.getElementById("content").style.background = backgroundTexture;

        /*   const inputBackgroundColor = <HTMLInputElement>document.getElementById("inputBackgroundColor");
           const referenceColor = backgroundTexture.startsWith("linear-gradient") ? inputBackgroundColor.value : backgroundTexture; //  color used to compute the colors of magnets etc.
   
           const getSlightlyModify = function (ratio: number): string {
               const color = Color(referenceColor);
   
               const newcolor = color.isLight() ? Color("white").fade(0.9) : Color("black").lighten(ratio).fade(0.9);
               return newcolor.string();
           };
   
           CSSStyleModifier.setRule(".magnetText div", "background-color", getSlightlyModify(0.1));
           CSSStyleModifier.setRule("div.magnetText", "background-color", getSlightlyModify(0.2));
           CSSStyleModifier.setRule("img.magnet", "background-color", getSlightlyModify(0.2));
           CSSStyleModifier.setRule(".magnetText div", "color", BackgroundTexture.getDefaultChalkColor());*/


    }





    /**
     * @returns the background texture, e.g. "black" if it is a blackboard, "white" if it is a whiteboard, 
     * "rgb(0, 0, 255)", etc.
     */
    static getBackgroundTexture(): string {
        return this.currentBackgroundTexture;
    }

    /**
     * @returns the default chalk color, "white" if it is a blackboard
     *                                   "black" if it is a whiteboard
     */
    static getDefaultChalkColor(): string {
        function isLight(bgTexture: string) {
            if (bgTexture.startsWith("linear-gradient")) {
                const extremityColors = bgTexture.substring("linear-gradient(".length, bgTexture.length - 1).split(",").map((s) => s.trim());
                return Color(extremityColors[0]).isLight() && Color(extremityColors[1]).isLight();
            }
            else
                return Color(bgTexture).isLight();
        }
        return isLight(BackgroundTexture.getBackgroundTexture()) ? "black" : "white";
    }

}


