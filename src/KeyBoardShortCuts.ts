import MagnetTextManager from './MagnetTextManager';
import { OptionManager } from './OptionManager';
import { AnimationToolBar } from './AnimationToolBar';
import { BoardManager } from './boardManager';
import { GUIActions } from './GUIActions';
import { BoardNavigation } from './BoardNavigation';
import { CircularMenu } from './CircularMenu';
import { Share } from "./share";
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Layout } from './Layout';
import { Toolbar } from './Toolbar';
import { Menu } from './Menu';
import { S, Script } from './Script';
import { Magnetizer } from './Magnetizer';
import { ToolDraw } from './ToolDraw';




const keys = {};

window['keys'] = keys;


/**
 * @description this class contains all the keyboard shortcuts
 */
export class KeyBoardShortCuts {

    private static available = true; /** a semaphor to avoid keyboard shortcuts to be triggered a lot */


    static onKeyUp(evt: KeyboardEvent): void {
        if (evt.key == "Shift")
            if (UserManager.me.isToolDraw)
                (<ToolDraw>UserManager.me.tool).updateNoMagnetPossibleConnection();

        delete keys[evt.key];
    }

    static onKeyDown(evt: KeyboardEvent): void {
        S.onkey(evt.key);
        keys[evt.key] = true;

        const keyLowerCase = evt.key.toLowerCase();

        if ((evt.key != "F11") &&
            (evt.key != "F12") &&
            (evt.key != "F5") &&
            !(evt.ctrlKey && keyLowerCase == "s") &&
            !(evt.ctrlKey && keyLowerCase == "o") &&
            !(document.activeElement instanceof HTMLInputElement) &&
            !(document.activeElement instanceof HTMLTextAreaElement))
            evt.preventDefault();
        //console.log("ctrl: " + evt.ctrlKey + " shift:" + evt.shiftKey + "key: " + evt.key)
        /*if (evt.key == "Backspace" && !(document.activeElement instanceof HTMLInputElement))
            evt.preventDefault();*/

        if (evt.key == "Escape" || evt.key == "F1") {//escape => show menu
            if (Layout.isMinimap)
                Layout.normal();
            else if (CircularMenu.isShown())
                CircularMenu.hide();
            else if (AnimationToolBar.isMenu())
                AnimationToolBar.hideMenu();
            else if (AnimationToolBar.is() && AnimationToolBar.isSelection())
                AnimationToolBar.deselect();
            else
                Menu.toggle();
        }

        if (Menu.isShown())
            return;

        if (evt.ctrlKey && evt.altKey && keyLowerCase == "n" && UserManager.me.canWrite) {// alt + n = new slide
            Share.execute("newSlide", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
            evt.preventDefault();
        }
        else if (evt.altKey && keyLowerCase == "n" && UserManager.me.canWrite) {// alt + n = new slide
            Share.execute("newSlideAndClear", [UserManager.me.userID]);
            AnimationToolBar.hideMenu();
            evt.preventDefault();
        }
        else if (evt.ctrlKey && evt.altKey && keyLowerCase == "k") { // clear the board
            Share.execute("boardReset", []);
        }
        else if (evt.ctrlKey && evt.altKey && keyLowerCase == "h") { // mouse cursor hidden or not
            OptionManager.toggle("cursorVisible");
        }
        else if (!evt.ctrlKey && !evt.shiftKey && keyLowerCase == "n") { //navigation
            Layout.toggleMinimap();
        }
        else if (!evt.ctrlKey && !evt.shiftKey && keyLowerCase == "c") // c => change color
            GUIActions.changeColor(true);
        else if (!evt.ctrlKey && evt.shiftKey && keyLowerCase == "c")
            GUIActions.previousColor(true);
        else if (!evt.ctrlKey && !evt.shiftKey && keyLowerCase == "t") { // t => tool menu 
            GUIActions.toolmenu.show({ x: UserManager.me.x, y: UserManager.me.y });
        }
        else if (evt.key == "+" || (evt.ctrlKey && evt.key == "="))
            GUIActions.magnetIncreaseSize();
        else if (evt.key == "-" || evt.key == "=")
            GUIActions.magnetDecreaseSize();
        else if (keyLowerCase == "b")
            GUIActions.magnetSwitchBackgroundForeground();
        else if (keyLowerCase == "e")  //e = switch eraser and chalk
            GUIActions.switchDrawEraser();
        else if (keyLowerCase == "f")
            GUIActions.fill();
        else if (keyLowerCase == "h")
            Toolbar.toggle();
        else if (keyLowerCase == "a")
            AnimationToolBar.toggle();
        else if (evt.key == "Enter" && CircularMenu.isShown())
            CircularMenu.hide();
        else if (evt.key == "ArrowLeft" && CircularMenu.isShown())
            GUIActions.palette.previous();
        else if (evt.key == "ArrowRight" && CircularMenu.isShown())
            GUIActions.palette.next();
        else if (evt.shiftKey && evt.key == "ArrowLeft" && !Layout.isMinimap) {
            BoardNavigation.left();
        }
        else if (evt.shiftKey && evt.key == "ArrowRight" && !Layout.isMinimap) {
            BoardNavigation.right();
        }
        else if (evt.key == "ArrowLeft" && !Layout.isMinimap) {
            BoardNavigation.leftPreviousPage();
        }
        else if (evt.key == "ArrowRight" && !Layout.isMinimap) {
            BoardNavigation.rightNextPage();
        }
        else if (evt.ctrlKey && keyLowerCase == "r") {
            Script.toggle();
        }
        else if (evt.key == "Shift") {
            if (UserManager.me.isToolDraw) {
                (<ToolDraw>UserManager.me.tool).updateMagnetPossibleConnection();
            }
        }
        else if (UserManager.me.canWrite)
            KeyBoardShortCuts.onKeyDownThatModifies(evt);
    }


    /**
     * 
     * @param evt 
     * @description executes the command corresponding to the keyboard event evt
     * This procedure should be executed only if the current user have the writing permissions
     */
    static onKeyDownThatModifies(evt: KeyboardEvent): void {
        const keyLowerCase = evt.key.toLowerCase();
        if (evt.key == "Enter") {
            MagnetTextManager.addMagnetText(UserManager.me.x, UserManager.me.y);
            evt.preventDefault(); //so that it will not add "new line" in the text element
        }
        else if (keyLowerCase == "d")  //d = divide screen
            Share.execute("divideScreen", [UserManager.me.userID, Layout.getXMiddle()]);
        else if ((evt.ctrlKey && evt.shiftKey && evt.key == "Z") || (evt.ctrlKey && evt.key == "y")) { //ctrl + shift + z OR Ctrl + Y = redo
            //Share.execute("redo", [UserManager.me.userID]);
            BoardManager.redo(UserManager.me.userID);
            evt.preventDefault();
        }
        else if (evt.ctrlKey && keyLowerCase == "z") {// ctrl + z = undo
            // Share.execute("cancel", [UserManager.me.userID]);
            BoardManager.cancel(UserManager.me.userID);
            evt.preventDefault();
        }
        else if (evt.shiftKey && evt.key == "PageDown") {
            if (!Share.isShared())
                BoardManager.fastNextPausedFrame();
        }
        else if (evt.key == "PageDown" || evt.key == "ArrowDown") {
            Share.execute("timelineNextPausedFrame", []);
        }
        else if (evt.key == "PageUp" || evt.key == "ArrowUp") {
            Share.execute("timelinePreviousPausedFrame", []);
        }
        else if (evt.ctrlKey && keyLowerCase == 'x') {//Ctrl + x
            CircularMenu.hide();
            Magnetizer.magnetize(UserManager.me.userID, true);
        }
        else if (evt.ctrlKey && keyLowerCase == 'c') {//Ctrl + c
            CircularMenu.hide();
            Magnetizer.magnetize(UserManager.me.userID, false);
            evt.preventDefault();
        }
        else if (evt.ctrlKey && keyLowerCase == "v") { //Ctrl + v = print the current magnet or (implementing in progress) paste the clipboard
            CircularMenu.hide();
            if (KeyBoardShortCuts.available) {
                KeyBoardShortCuts.available = false;
                setTimeout(() => KeyBoardShortCuts.available = true, 1000);

                //   if (MagnetManager.getMagnetUnderCursor())
                Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
                /* else
                     GUIActions.pasteFromClipBoard();*/


            }
        }
        else if (keyLowerCase == "m") { //m = make new magnets
            CircularMenu.hide();
            if (!Magnetizer.isSuitableForMagnetisation(UserManager.me.userID)) {
                Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
                MagnetManager.removeCurrentMagnet();
            }
            else {
                Magnetizer.magnetize(UserManager.me.userID, true);
            }
        }
        else if (evt.key == "p") { //p = print the current magnet
            CircularMenu.hide();
            Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
        }
        else if (evt.key == "Delete" || evt.key == "x" || evt.key == "Backspace") { //supr = delete the current magnet
            CircularMenu.hide();
            /*if (lastDelineation.containsPolygonToMagnetize())
                lastDelineation.erase();
            else*/
            MagnetManager.removeCurrentMagnet();
            evt.preventDefault();
        }
    }

}