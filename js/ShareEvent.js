class ShareEvent {
    static mousedown(userId, evt) {
        console.log("mousedown", userId)
        users[userId].mousedown(evt);
    }

    static mousemove(userId, evt) {
        users[userId].mousemove(evt);
    }

    static mouseup(userId, evt) {
        users[userId].mouseup(evt);
    }
}