import { AnimationToolBar } from './AnimationToolBar';
import { ActionDeserializer } from './ActionDeserializer';
import MagnetTextManager from './MagnetTextManager';
import { ActionMagnetNew } from './ActionMagnetNew';
import { MagnetMovementRecorder } from './MagnetMovementRecorder';
import { Wallpaper } from './Wallpaper';
import { UserListComponent } from './UserListComponent';
import { ShowMessage } from './ShowMessage';
import { BackgroundTexture } from './BackgroundTexture';
import { Share } from './share';
import { LoadSave } from './LoadSave';
import { Layout } from './Layout';
import { BackgroundDocuments } from './BackgroundDocuments';
import { MagnetManager } from './magnetManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { Discussion } from './Discussion';
import { Menu } from './Menu';
import { Drawing } from './Drawing';
import { ToolArc } from './ToolArc';
import { ActionMagnetChangeSizeRatio } from './ActionMagnetChangeSizeRatio';
import { ActionMagnetSwitchBackgroundForeground } from './ActionMagnetSwitchBackgroundForeground';
import { Magnetizer } from './Magnetizer';

/**
 * this class contains the events that are shared with other users connected to the same tableaunoir
 * */

export class ShareEvent {
    /** mouse events */
    static mousedown(userId: string, evt: MouseEvent): void {
        UserManager.users[userId].mousedown(evt);
    }

    static mousemove(userId: string, evt: MouseEvent): void {
        if (UserManager.users[userId] == undefined)
            console.log("why is " + userId + " not declared?");
        UserManager.users[userId].mousemove(evt);
    }

    static mouseup(userId: string, evt: MouseEvent): void {
        UserManager.users[userId].mouseup(evt);
    }

    /**tools */
    static setCurrentColor(userId: string, color: string): void {
        UserManager.users[userId].setCurrentColor(color);
    }

    static switchEraser(userId: string): void { UserManager.users[userId].switchEraser(); }
    static switchDraw(userId: string): void { UserManager.users[userId].switchDraw(); }
    static switchLine(userId: string): void { UserManager.users[userId].switchLine(); }
    static switchRectangle(userId: string): void { UserManager.users[userId].switchRectangle(); }
    static switchEllipseByBorder(userId: string): void { UserManager.users[userId].switchEllipseByBorder(); }
    static switchEllipseByCenter(userId: string): void { UserManager.users[userId].switchEllipseByCenter(); }
    static switchArc(userId: string): void { UserManager.users[userId].switchArc(); }

    static toolArcSetAttributes(userId: string, center: { x: number, y: number }, radiusHandlePosition: { x: number, y: number }): void {
        console.log(userId)
        const tool = UserManager.users[userId].tool;
        if (!(tool instanceof ToolArc))
            ShowMessage.error("the tool should be ToolArc");

        (<ToolArc>tool).setAttributes(center, radiusHandlePosition);
    }

    /**users */

    static setCanWriteValueByDefault(bool: boolean): void {
        Share.canWriteValueByDefault = bool;
    }

    static setUserCanWrite(userId: string, bool: boolean): void {
        UserManager.setUserCanWrite(userId, bool);
    }


    static setUserName(userid: string, name: string): void {
        UserManager.users[userid].name = name;
        UserListComponent.updateGUIUser(userid);
    }


    /** board */

    /**
     * reset the board: it means
     * - we clear the board
     * - we clear the timeline
     * - we clear the cancel stack
     */
    static boardReset(): void {
        BoardManager.reset();
        Menu.hide();
    }


    /**
     * clear the board
     * - we clear the board
     * - we add the action "clear the board" in the timeline
     */
    static boardClear(): void { BoardManager.newSlideAndClear(UserManager.me.userID); }


    /**
     * @param atLeastWidth
     * @description 
     */
    static setWidthAtLeast(atLeastWidth: number): void { BoardManager.setWidthAtLeast(atLeastWidth); }


    /**
     * 
     * @param userid 
     * @param x 
     * @description 
     */
    static divideScreen(userid: string, x: number): void { Drawing.divideScreen(userid, x); }

    /**questions */
    static questionAdd(userID: string, idquestion: string, question: string): void {
        Discussion.addQuestion(userID, idquestion, question);
    }


    /**
     * @param userid
     * @description set the user of userid to be a root
     */
    static setRoot(userid: string): void { Share.setRoot(userid); }


    static questionRemove(questionID: string): void { Discussion.removeQuestion(questionID); }

    /** magnets */
    static magnetize(userID: string, magnetid: string, iaction: number, cut: boolean): void {
        Magnetizer.performMagnetize(userID, magnetid, iaction, cut);
    }


    static undomagnetize(userID: string, iaction, cut, previousActionJSON: string) {
        const previousAction = ActionDeserializer.deserialize(JSON.parse(previousActionJSON));
        Magnetizer.undoMagnetize(userID, iaction, cut, previousAction);
    }


    static clearPolygon(points: { x: number, y: number }[]): void {
        Drawing.clearPolygon(points);
    }

    static printMagnet(magnetID: string): void {
        MagnetManager.printMagnet(document.getElementById(magnetID));
    }

    static magnetChange(userid: string, idMagnet: string, outerHTML: string): void {
        const magnet = document.getElementById(idMagnet);
        if (magnet.outerHTML != outerHTML) {
            magnet.outerHTML = outerHTML;
            MagnetManager.installMagnets();
        }
        if (MagnetTextManager.isTextMagnet(magnet)) {
            const action = BoardManager.getLastAction();
            if (action instanceof ActionMagnetNew) //if the text magnet was just added, modifying it will just update it
                action.setMagnet(magnet);
            else
                BoardManager.addAction(new ActionMagnetNew(userid, magnet));
        }
        else
            BoardManager.addAction(new ActionMagnetNew(userid, magnet));
    }



    static magnetChangeSize(userID: string, idmagnet: string, ratio: number): void {
        BoardManager.addAction(new ActionMagnetChangeSizeRatio(userID, idmagnet, ratio), true);
    }

    static magnetSwitchBackgroundForeground(userID: string, idmagnet: string) {
        BoardManager.addAction(new ActionMagnetSwitchBackgroundForeground(UserManager.me.userID, idmagnet));
    }

    static magnetMoveStart(idMagnet: string): void {
        MagnetMovementRecorder.start(idMagnet);
    }

    static magnetMove(idMagnet: string, x: string, y: string): void {
        const ix = parseInt(x);
        const iy = parseInt(y);
        MagnetMovementRecorder.move(idMagnet, ix, iy);
    }

    static magnetMoveStop(idMagnet: string): void {
        MagnetMovementRecorder.stop(idMagnet);
    }


    static magnetsClear(): void { MagnetManager.clearMagnet(); }

    static magnetRemove(idMagnet: string): void { MagnetManager.magnetRemove(idMagnet); }


    static timelineAddAction(t: number, actionSerialized: string): void {
        BoardManager.timeline.insertAction(ActionDeserializer.deserialize(JSON.parse(actionSerialized)), t);
    }


    static timelineRemoveAction(t: number): void { BoardManager.timeline.deleteAction(t); }

    static timelineSetCurrentIndex(t: number): void {
        BoardManager.setTimeLineCurrentIndex(t);
        AnimationToolBar.update();
    }
    static timelinePreviousFrame(): void { BoardManager.previousFrame() }
    static timelinePreviousPausedFrame(): void { BoardManager.previousPausedFrame() }
    static timelineNextFrame(): void { BoardManager.nextFrame() }
    static timelineNextPausedFrame(): void { BoardManager.nextPausedFrame() }
    static newSlide(userid: string): void { BoardManager.newSlide(userid) }
    static newSlideAndClear(userid: string): void { BoardManager.newSlideAndClear(userid) }
    static mergeSlide(userid: string): void { BoardManager.mergeSlide(userid) }

    /**backgrounds */

    static backgroundClear(): void { Wallpaper.clear(); }

    static backgroundMusicScore(): void { Wallpaper.musicScore(); }

    static backgroundGrid(): void { Wallpaper.grid(); }

    static backgroundSeyes(): void { Wallpaper.seyes(); }

    /**documents */
    static documentsRemoveAll(): void {
        BackgroundDocuments.getDocumentPanel().innerHTML = "";
    }

    static insertDocumentImage(dataURL: string, x: number): void {
        const img = document.createElement("img");
        img.src = dataURL;
        img.style.position = "absolute";
        img.style.left = x + "px";
        img.style.top = "0px";
        img.style.height = Layout.STANDARDHEIGHT + "px";
        BackgroundDocuments.getDocumentPanel().appendChild(img);
    }

    /**
     * 
     * @param data 
     * @descripttion loads a .tableaunoir file!
     */
    static loadBoard(data: string): void { LoadSave.loadJSON(JSON.parse(data)); }

    static setBackgroundColor(color: "white" | "black"): void { BackgroundTexture.switchTo(color); }
}



