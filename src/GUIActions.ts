import { AnimationToolBar } from './AnimationToolBar';
import { OptionManager } from './OptionManager';
import { ToolMenu } from './ToolMenu';
import { Palette } from "./Palette";
import { Share } from "./share";
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';

export class GUIActions {

    static palette = new Palette();
    static toolmenu = new ToolMenu();

    static paletteShowOnKey = true;

    static init(): void {
        GUIActions.palette.onchange = () => {
            if(AnimationToolBar.isActionSelected) {
//TODO: recolorize the actions that are selected in the timeline :)
            }


            if (UserManager.me.isToolErase)
                Share.execute("switchChalk", [UserManager.me.userID]);
            Share.execute("setCurrentColor", [UserManager.me.userID, GUIActions.palette.getCurrentColor()]);
            
        }


        OptionManager.boolean({
            name: "paletteShowOnKey", defaultValue: true,
            onChange: (b) => { GUIActions.paletteShowOnKey = b}
        });
    }


    static changeColor(calledFromKeyBoard = false): void {
        if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
            if (!UserManager.me.tool.isDrawing && (GUIActions.paletteShowOnKey || !calledFromKeyBoard))
                GUIActions.palette.show({ x: UserManager.me.tool.x, y: UserManager.me.tool.y });
            GUIActions.palette.next();
        }
        else { // if there is a magnet change the background of the magnet
            const magnet = MagnetManager.getMagnetUnderCursor();
            magnet.style.backgroundColor = MagnetManager.nextBackgroundColor(magnet.style.backgroundColor);
        }
    }

    static previousColor(calledFromKeyBoard = false): void {
        if (MagnetManager.getMagnetUnderCursor() == undefined) { //if no magnet under the cursor, change the color of the chalk
            UserManager.me.switchChalk();

            if (!UserManager.me.tool.isDrawing && (GUIActions.paletteShowOnKey || !calledFromKeyBoard))
                GUIActions.palette.show({ x: UserManager.me.tool.x, y: UserManager.me.tool.y });
            GUIActions.palette.previous();
        }
        else { // if there is a magnet change the background of the magnet
            const magnet = MagnetManager.getMagnetUnderCursor();
            magnet.style.backgroundColor = MagnetManager.previousBackgroundColor(magnet.style.backgroundColor);
        }
    }

    static switchChalkEraser(): void {
        if (!UserManager.me.isToolDraw)
            Share.execute("switchChalk", [UserManager.me.userID]);
        else
            Share.execute("switchErase", [UserManager.me.userID]);


    }



}