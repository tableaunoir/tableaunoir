/**
 * this class contains the events that are shared with other users connected to the same tableaunoir
 * */
var ShareEvent = /** @class */ (function () {
    function ShareEvent() {
    }
    ShareEvent.mousedown = function (userId, evt) {
        UserManager.users[userId].mousedown(evt);
    };
    ShareEvent.mousemove = function (userId, evt) {
        if (UserManager.users[userId] == undefined)
            console.log("why is " + userId + " not declared?");
        UserManager.users[userId].mousemove(evt);
    };
    ShareEvent.mouseup = function (userId, evt) {
        UserManager.users[userId].mouseup(evt);
    };
    ShareEvent.setCurrentColor = function (userId, color) {
        UserManager.users[userId].setCurrentColor(color);
    };
    ShareEvent.switchErase = function (userId) {
        UserManager.users[userId].switchErase();
    };
    ShareEvent.switchChalk = function (userId) {
        UserManager.users[userId].switchChalk();
    };
    ShareEvent.setUserCanWrite = function (userId, bool) {
        UserManager.users[userId].setCanWrite(bool);
    };
    ShareEvent.magnetMove = function (idMagnet, x, y) {
        var el = document.getElementById(idMagnet);
        el.style.top = y + "px";
        el.style.left = x + "px";
    };
    ShareEvent.magnetsClear = function () {
        MagnetManager.clearMagnet();
    };
    ShareEvent.magnetRemove = function (idMagnet) {
        MagnetManager.magnetRemove(idMagnet);
    };
    ShareEvent.magnetChange = function (idMagnet, outerHTML) {
        document.getElementById(idMagnet).outerHTML = outerHTML;
    };
    ShareEvent.boardClear = function () {
        BoardManager._clear();
        BoardManager.save();
        Menu.hide();
    };
    ShareEvent.questionAdd = function (userID, idquestion, question) {
        Discussion.addQuestion(userID, idquestion, question);
    };
    ShareEvent.questionRemove = function (questionID) {
        Discussion.removeQuestion(questionID);
    };
    return ShareEvent;
}());
//# sourceMappingURL=ShareEvent.js.map