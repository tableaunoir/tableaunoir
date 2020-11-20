import { MagnetManager } from './magnetManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { Discussion } from './Discussion';
import { Menu } from './Menu';
import { Drawing } from './Drawing';

/**
 * this class contains the events that are shared with other users connected to the same tableaunoir
 * */

export class ShareEvent {
    static mousedown(userId: string, evt): void {
        UserManager.users[userId].mousedown(evt);
    }

    static mousemove(userId: string, evt): void {
        if (UserManager.users[userId] == undefined)
            console.log("why is " + userId + " not declared?");
        UserManager.users[userId].mousemove(evt);
    }

    static mouseup(userId: string, evt): void {
        UserManager.users[userId].mouseup(evt);
    }

    static setCurrentColor(userId: string, color: string): void {
        UserManager.users[userId].setCurrentColor(color);
    }

    static switchErase(userId: string): void {
        UserManager.users[userId].switchErase();
    }

    static switchChalk(userId: string): void {
        UserManager.users[userId].switchChalk();
    }

    static setUserCanWrite(userId: string, bool: boolean): void {
        UserManager.users[userId].setCanWrite(bool);
    }

    static magnetMove(idMagnet: string, x: string, y: string): void {
        const ix = parseInt(x);
        const iy = parseInt(y);
        const el = document.getElementById(idMagnet);
        el.style.top = iy + "px";
        el.style.left = ix + "px";
    }


    static magnetsClear(): void {
        MagnetManager.clearMagnet();
    }

    static magnetRemove(idMagnet: string): void {
        MagnetManager.magnetRemove(idMagnet);
    }

    static magnetChange(idMagnet: string, outerHTML: string): void {
        document.getElementById(idMagnet).outerHTML = outerHTML;
    }

    static boardClear(): void {
        BoardManager._clear();
        BoardManager.save(undefined);
        Menu.hide();
    }

    static questionAdd(userID: string, idquestion: string, question: string): void {
        Discussion.addQuestion(userID, idquestion, question);
    }


    static questionRemove(questionID: string): void {
        Discussion.removeQuestion(questionID);
    }

    static removeContour(points: { x: number, y: number }[]): void {
        Drawing.removeContour(points);
    }

    static clearPolygon(points: { x: number, y: number }[]): void {
        Drawing.clearPolygon(points);
    }

    static printMagnet(magnetID: string): void {
        MagnetManager.printMagnet(document.getElementById(magnetID));
    }

    static cancel(): void {
        BoardManager.cancel();
    }

    static redo(): void {
        BoardManager.redo();
    }

    static setUserName(userid: string, name: string): void {
        UserManager.users[userid].name = name;
        UserManager.updateGUIUsers();
    }
}
