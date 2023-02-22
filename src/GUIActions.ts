import MagnetTextManager from './MagnetTextManager';
import { ActionFill } from './ActionFill';
import { Layout } from './Layout';
import { ShowMessage } from './ShowMessage';
import { S } from './Script';
import { AnimationToolBar } from './AnimationToolBar';
import { OptionManager } from './OptionManager';
import { ToolMenu } from './ToolMenu';
import { Palette } from "./Palette";
import { Share } from "./share";
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { BoardManager } from './boardManager';
import { ActionFreeDraw } from './ActionFreeDraw';
import { ActionRectangle } from './ActionRectangle';
import { ActionEllipse } from './ActionEllipse';

export class GUIActions {

    /**
     * fill either the last zone that was drawn
     * or the magnet under the cursor if there is one
     */
    static fill(): void {
        const magnet = MagnetManager.getMagnetUnderCursor();
        if (magnet)
            magnet.style.backgroundColor = UserManager.me.color;
        else {
            const iaction = BoardManager.timeline.getIndexLastActionByUser(UserManager.me.userID);
            const action = BoardManager.timeline.actions[iaction];
            if (action != undefined)
                if (action instanceof ActionFreeDraw || action instanceof ActionRectangle || action instanceof ActionEllipse) {
                    BoardManager.addAction(new ActionFill(UserManager.me.userID, action.contour, UserManager.me.color));

                }
        }
    }

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
                    magnet.style.left = Layout.getWindowLeft() + "px";
                    magnet.style.top = "0px";
                    console.log(dataURL);
                    MagnetManager.addMagnet(magnet);
                }));
            })
        }
        catch (e) {
            ShowMessage.error(e);
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
                Share.execute("switchDraw", [UserManager.me.userID]);
            Share.execute("setCurrentColor", [UserManager.me.userID, GUIActions.palette.getCurrentColor()]);

        }





        OptionManager.boolean({
            name: "paletteShowOnKey", defaultValue: true,
            onChange: (b) => { GUIActions.paletteShowOnKey = b }
        });
    }


    static changeColor(calledFromKeyBoard = false): void {
        if (!UserManager.me.tool.isDrawing && (GUIActions.paletteShowOnKey || !calledFromKeyBoard))
            GUIActions.palette.show({ x: UserManager.me.tool.x, y: UserManager.me.tool.y });
        GUIActions.palette.next();

    }

    static previousColor(calledFromKeyBoard = false): void {
        if (!UserManager.me.tool.isDrawing && (GUIActions.paletteShowOnKey || !calledFromKeyBoard))
             GUIActions.palette.show({ x: UserManager.me.tool.x, y: UserManager.me.tool.y });
        GUIActions.palette.previous();
    }

    static switchDrawEraser(): void {
        if (!UserManager.me.isToolDraw)
            Share.execute("switchDraw", [UserManager.me.userID]);
        else
            Share.execute("switchEraser", [UserManager.me.userID]);
    }





    static magnetChangeSize(ratio: number): void {
        const magnet = MagnetManager.getMagnetUnderCursor();
        if (magnet) {
            if (!MagnetTextManager.isTextMagnet(magnet)) {
                const id = magnet.id;
                Share.execute("magnetChangeSize", [UserManager.me.userID, id, ratio])

            }
        }
    }

    static magnetIncreaseSize(): void { GUIActions.magnetChangeSize(1.1); }
    static magnetDecreaseSize(): void { GUIActions.magnetChangeSize(0.9); }


    /**
     * switch the "background/foreground state" of the magnet under the cursor
     * if the magnet is in the foreground, it moves that magnet background
     * if the magnet is in the background, it moves that magnet foreground
     */
    static magnetSwitchBackgroundForeground(): void {
        const magnetGetRectangle = (m: HTMLElement) => {
            const x1 = parseInt(m.style.left);
            const y1 = parseInt(m.style.top);
            return { x1: x1, y1: y1, x2: x1 + m.clientWidth, y2: y1 + m.clientHeight };
        }


        const switchBackgroundForegroundOfMagnet = (m: HTMLElement) => {
            Share.execute("magnetSwitchBackgroundForeground", [UserManager.me.userID, m.id])
        }

        /** get the magnet under the cursor for magnet that are in the background (cannot use the standard mousemove
         * because these magnets are hidden by the canvas) */
        const getMagnetBackgroundUnderCursor = () => {
            const magnets = MagnetManager.getMagnets();
            for (let i = 0; i < magnets.length; i++) {
                const m = magnets[i];
                if (S.inRectangle({ x: x, y: y }, magnetGetRectangle(m))) {
                    return m;
                }
            }
            return undefined;
        }
        const magnet = MagnetManager.getMagnetUnderCursor();
        const x = UserManager.me.x;
        const y = UserManager.me.y;
        console.log(x, y);


        if (magnet == undefined) {
            const m = getMagnetBackgroundUnderCursor();
            if (m)
                switchBackgroundForegroundOfMagnet(m);
        }
        else switchBackgroundForegroundOfMagnet(magnet);

    }

}