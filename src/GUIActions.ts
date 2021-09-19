import { Layout } from './Layout';
import { ErrorMessage } from './ErrorMessage';
import { S } from './Script';
import { AnimationToolBar } from './AnimationToolBar';
import { OptionManager } from './OptionManager';
import { ToolMenu } from './ToolMenu';
import { Palette } from "./Palette";
import { Share } from "./share";
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { ActionMagnetSwitchBackgroundForeground } from './ActionMagnetSwitchBackgroundForeground';
import { BoardManager } from './boardManager';

export class GUIActions {

    /**
     * @description tries to paste a magnet from the content of the clipboard
     */
    static pasteFromClipBoard(): void {
        try {
            //the <any> is because Typescript does not infer properly the types :(
            (<any>(navigator.clipboard)).read().then((items) => {
                function blobToDataURL(blob: Blob, callback: (dataURL: string) => void) {
                    const a = new FileReader();
                    a.onload = function (e) { callback(<string>e.target.result); }
                    a.readAsDataURL(blob);
                }
                console.log(items[0])

                console.log(items[0].types)
                console.log(items[0].getType("image/png"));
                items[0].getType("image/png").then((blob: Blob) => blobToDataURL(blob, (dataURL) => {
                    const magnet = new Image();
                    magnet.src = dataURL;
                    magnet.style.left = Layout.getWindowLeft()+"px";
                    magnet.style.top = "0px";
                    console.log(dataURL);
                    MagnetManager.addMagnet(magnet);
                }));
            })
        }
        catch (e) {
            ErrorMessage.show(e);
        }
    }

    static palette = new Palette();
    static toolmenu = new ToolMenu();

    static paletteShowOnKey = true;

    static init(): void {
        GUIActions.palette.onchange = () => {
            if (AnimationToolBar.isActionSelected) {
                //TODO: recolorize the actions that are selected in the timeline :)
            }


            if (UserManager.me.isToolErase)
                Share.execute("switchChalk", [UserManager.me.userID]);
            Share.execute("setCurrentColor", [UserManager.me.userID, GUIActions.palette.getCurrentColor()]);

        }


        OptionManager.boolean({
            name: "paletteShowOnKey", defaultValue: true,
            onChange: (b) => { GUIActions.paletteShowOnKey = b }
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



    static magnetChangeSize(ratio): void {
        const magnet = MagnetManager.getMagnetUnderCursor();
        if (!magnet.style.width)
            magnet.style.width = magnet.clientWidth + "px";
        magnet.style.width = (parseInt(magnet.style.width) * ratio) + "px";
    }

    static magnetIncreaseSize(): void {
        GUIActions.magnetChangeSize(1.1);
    }



    static magnetDecreaseSize(): void {
        GUIActions.magnetChangeSize(0.9);
    }







    static magnetSwitchBackgroundForeground(): void {
        const magnetGetRectangle = (m: HTMLElement) => {
            const rect = m.getBoundingClientRect();
            return { x1: rect.x, y1: rect.y, x2: rect.x + rect.width, y2: rect.y + rect.height };
        }


        const switchBackgroundForegrounOfMagnet = (m) => {
            BoardManager.addAction(new ActionMagnetSwitchBackgroundForeground(UserManager.me.userID, m.id));
        }

        const magnet = MagnetManager.getMagnetUnderCursor();
        const x = UserManager.me.tool.x;
        const y = UserManager.me.tool.y;
        if (magnet == undefined) {
            const magnets = MagnetManager.getMagnets();
            for (let i = 0; i < magnets.length; i++) {
                const m = magnets[i];
                if (S.inRectangle({ x: x, y: y }, magnetGetRectangle(m))) {
                    switchBackgroundForegrounOfMagnet(m);
                }
                /**TODO: search for the magnet in the background that is under the cursor**/
            }
        }
        else switchBackgroundForegrounOfMagnet(magnet);

    }

}