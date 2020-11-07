var Discussion = /** @class */ (function () {
    function Discussion() {
    }
    Discussion.askQuestion = function () {
        var question = prompt("Type the question you want to ask:");
        if (question != null)
            Share.execute("questionAdd", [UserManager.me.userID, question]);
    };
    Discussion.addQuestion = function (userID, question) {
        var questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.innerHTML = question;
        questionElement.onclick = function () { questionElement.remove(); };
        document.getElementById("questions").appendChild(questionElement);
    };
    return Discussion;
}());
//# sourceMappingURL=Discussion.js.map