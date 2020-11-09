var Discussion = /** @class */ (function () {
    function Discussion() {
    }
    Discussion.generateID = function () {
        return "d" + Math.random();
    };
    Discussion.init = function () {
        document.getElementById("questions").hidden = true;
    };
    Discussion.askQuestion = function () {
        var question = prompt("Type your question/comment:");
        if (question == null)
            return;
        question = question.trim();
        if (question == "")
            return;
        Share.execute("questionAdd", [UserManager.me.userID, Discussion.generateID(), question]);
    };
    Discussion.removeQuestion = function (questionID) {
        document.getElementById(questionID).remove();
        if (document.getElementById("questions").children.length == 0)
            document.getElementById("questions").hidden = true;
    };
    Discussion.addQuestion = function (userID, idquestion, question) {
        var questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.id = idquestion;
        questionElement.innerHTML = UserManager.getUserImage(userID).outerHTML + question;
        questionElement.onclick = function () {
            if (UserManager.me.canWrite) {
                Share.execute("questionRemove", [questionElement.id]);
            }
        };
        document.getElementById("questions").appendChild(questionElement);
        document.getElementById("questions").hidden = false;
    };
    return Discussion;
}());
//# sourceMappingURL=Discussion.js.map