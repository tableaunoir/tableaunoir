import { GUIActions } from './GUIActions';
import { BoardNavigation } from './BoardNavigation';
import { CircularMenu } from './CircularMenu';
import { Share } from "./share";
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Layout } from './Layout';
import { Toolbar } from './Toolbar';
import { Menu } from './Menu';


export class KeyBoardShortCuts {

    private static available = true;


    static onKeyDown(evt: KeyboardEvent): void {
        //console.log("ctrl: " + evt.ctrlKey + " shift:" + evt.shiftKey + "key: " + evt.key)
        if (evt.key == "Backspace" && !(document.activeElement instanceof HTMLInputElement))
            evt.preventDefault();

        if (evt.key == "Escape" || evt.key == "F1") {//escape => show menu
            if (Layout.isMinimap)
                Layout.normal();
            else if (CircularMenu.isShown())
                CircularMenu.hide();
            else
                Menu.toggle();
        }

        if (Menu.isShown())
            return;

        if (!evt.ctrlKey && !evt.shiftKey && evt.key == "n") { //navigation
            if (Layout.isMinimap)
                Layout.normal();
            else
                Layout.minimap();
        }
        else if (!evt.ctrlKey && !evt.shiftKey && evt.key == "c") // c => change color
            GUIActions.changeColor(true);
        else if (!evt.ctrlKey && evt.shiftKey && evt.key == "C")
            GUIActions.previousColor(true);
        else if (!evt.ctrlKey && !evt.shiftKey && evt.key == "t") { // t => tool menu 
            GUIActions.toolmenu.show({ x: UserManager.me.x, y: UserManager.me.y });
        }
        else if (evt.key == "e")  //e = switch eraser and chalk
            GUIActions.switchChalkEraser();
        else if (evt.key == "h")
            Toolbar.toggle();
        else if (evt.key == "Enter" && CircularMenu.isShown())
            CircularMenu.hide();
        else if (evt.key == "ArrowLeft" && CircularMenu.isShown())
            GUIActions.palette.previous();
        else if (evt.key == "ArrowRight" && CircularMenu.isShown())
            GUIActions.palette.next();
        else if (evt.shiftKey && evt.key == "ArrowLeft") {
            BoardNavigation.left();
        }
        else if (evt.shiftKey && evt.key == "ArrowRight") {
            BoardNavigation.right();
        }
        else if (evt.key == "ArrowLeft") {
            BoardNavigation.leftPreviousPage();
        }
        else if (evt.key == "ArrowRight") {
            BoardNavigation.rightNextPage();
        }
        else if (UserManager.me.canWrite) {
            KeyBoardShortCuts.onKeyDownThatModifies(evt);
        }
    }


    /**
     * 
     * @param evt 
     */
    static onKeyDownThatModifies(evt: KeyboardEvent): void {
        if (evt.key == "Enter") {
            MagnetManager.addMagnetText(UserManager.me.x, UserManager.me.y);
            evt.preventDefault(); //so that it will not add "new line" in the text element
        }
        else if (evt.key == "d")  //d = divide screen
            Share.execute("divideScreen", [UserManager.me.userID, Layout.getXMiddle()]);
        else if ((evt.ctrlKey && evt.shiftKey && evt.key == "Z") || (evt.ctrlKey && evt.key == "y")) { //ctrl + shift + z OR Ctrl + Y = redo
            Share.execute("redo", [UserManager.me.userID]);
            evt.preventDefault();
        }
        else if (evt.ctrlKey && evt.key == "z") {// ctrl + z = undo
            Share.execute("cancel", [UserManager.me.userID]);
            evt.preventDefault();
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() == 'x') {//Ctrl + x
            CircularMenu.hide();
            if (!UserManager.me.isDelineation)
                return;
            const deli = UserManager.me.lastDelineation;
            if (deli.containsPolygonToMagnetize())
                Share.execute("magnetize", [UserManager.me.userID, true, evt.key == "x"]);
        }
        else if (evt.ctrlKey && evt.key.toLowerCase() == 'c') {//Ctrl + c
            CircularMenu.hide();
            if (!UserManager.me.isDelineation)
                return;
            const deli = UserManager.me.lastDelineation;
            if (deli.containsPolygonToMagnetize())
                Share.execute("magnetize", [UserManager.me.userID, false, evt.key == "c"]);
            evt.preventDefault();
        }
        else if (evt.ctrlKey && evt.key == "v") { //Ctrl + v = print the current magnet
            CircularMenu.hide();
            if (KeyBoardShortCuts.available) {
                KeyBoardShortCuts.available = false;
                setTimeout(() => KeyBoardShortCuts.available = true, 1000);
                Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
            }
        }
        else if (evt.key.toLowerCase() == "m") { //m = make new magnets
            CircularMenu.hide();
            if (!UserManager.me.isDelineation) {
                Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
                MagnetManager.removeCurrentMagnet();
            }
            else {
                const deli = UserManager.me.lastDelineation;
                if (deli.containsPolygonToMagnetize()) {
                    Share.execute("magnetize", [UserManager.me.userID, true, evt.key == "m"]);
                }
                else {
                    Share.execute("printMagnet", [MagnetManager.getCurrentMagnetID()]);
                    MagnetManager.removeCurrentMagnet();
                }
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