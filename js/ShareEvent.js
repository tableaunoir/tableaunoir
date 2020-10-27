class ShareEvent {
    static mousedown(userId, evt) {
        users[userId].mousedown(evt);
    }

    static mousemove(userId, evt) {
        users[userId].mousemove(evt);
    }

    static mouseup(userId, evt) {
        users[userId].mouseup(evt);
    }
}