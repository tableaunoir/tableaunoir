/** 
 * this class contains the events that are shared with other users connected to the same tableaunoir 
 * */

class ShareEvent {
    static mousedown(userId, evt) {
        UserManager.users[userId].mousedown(evt);
    }

    static mousemove(userId, evt) {
        if (UserManager.users[userId] == undefined)
            console.log("why is " + userId + " not declared?");
        UserManager.users[userId].mousemove(evt);
    }

    static mouseup(userId, evt) {
        UserManager.users[userId].mouseup(evt);
    }

    static setCurrentColor(userId, color) {
        UserManager.users[userId].setCurrentColor(color);
    }

    static switchErase(userId) {
        UserManager.users[userId].switchErase();
    }

    static switchChalk(userId) {
        UserManager.users[userId].switchChalk();
    }

    static setUserCanWrite(userId, bool) {
        UserManager.users[userId].setCanWrite(bool);
    }

    static magnetMove(idMagnet, x, y) {
        const el = document.getElementById(idMagnet);
        el.style.top = y + "px";
        el.style.left = x + "px";
    }


    static magnetsClear() {
        MagnetManager.clearMagnet();
    }

    static magnetRemove(idMagnet) {
        MagnetManager.magnetRemove(idMagnet)
    }

    static boardClear() {
        BoardManager._clear();
        BoardManager.save();
        Menu.hide();
    }
}