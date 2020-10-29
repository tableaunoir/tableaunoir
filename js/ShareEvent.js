class ShareEvent {
    static mousedown(userId, evt) {
        users[userId].mousedown(evt);
    }

    static mousemove(userId, evt) {
        if (users[userId] == undefined)
            console.log("why is " + userId + " not declared?");
        users[userId].mousemove(evt);
    }

    static mouseup(userId, evt) {
        users[userId].mouseup(evt);
    }

    static setCurrentColor(userId, color) {
        users[userId].setCurrentColor(color);
    }

    static switchErase(userId) {
        users[userId].switchErase();
    }

    static switchChalk(userId) {
        users[userId].switchChalk();
    }

    static setUserCanWrite(userId, bool) {
        users[userId].setCanWrite(bool);
    }
}