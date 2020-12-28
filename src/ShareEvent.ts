import { PDFDocument } from './PDFDocument';
import { PDFViewer } from './PDFViewer';
import { ConstraintDrawing } from './ConstraintDrawing';
import { Background } from './Background';
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

    static setCurrentColor(userId: string, color: string): void {
        UserManager.users[userId].setCurrentColor(color);
    }

    static switchErase(userId: string): void {
        UserManager.users[userId].switchErase();
    }

    static switchChalk(userId: string): void {
        UserManager.users[userId].switchChalk();
    }

    static switchLine(userId: string): void {
        UserManager.users[userId].switchLine();
    }

    static switchRectangle(userId: string): void {
        UserManager.users[userId].switchRectangle();
    }

    static switchEllipseByBorder(userId: string): void {
        UserManager.users[userId].switchEllipseByBorder();
    }

    static switchEllipseByCenter(userId: string): void {
        UserManager.users[userId].switchEllipseByCenter();
    }

    static switchArc(userId: string): void {
        UserManager.users[userId].switchArc();
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
        ConstraintDrawing.update();
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

    static cancel(userID: string): void {
        BoardManager.cancel(userID);
    }

    static redo(userID: string): void {
        BoardManager.redo(userID);
    }

    static setUserName(userid: string, name: string): void {
        UserManager.users[userid].name = name;
        UserManager.updateGUIUsers();
    }

    static setBackground(dataURL: string): void {
        Background.set(dataURL);
    }

    static async setPDF(dataURL: string): Promise<void> {
        Background.pdfdoc = new PDFDocument();
        await Background.pdfdoc.open(dataURL);
    }


    static async insertPDFPage(pagenum: number, x: number): Promise<void> {
        const canvas = await Background.pdfdoc.getCanvasPage(pagenum);
        canvas.style.left = x + "px";
        canvas.style.top = "0px";
        document.getElementById("pdf").appendChild(canvas);
    }

    static backgroundClear(): void {
        Background.clear();
    }

    static backgroundMusicScore(): void {
        Background.musicScore();
    }

    static backgroundGrid(): void {
        Background.grid();
    }
}
