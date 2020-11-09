/**
 * Discussion (students that can ask questions, make comments)
 * The message appears at the bottom of the page
 */
var Discussion = /** @class */ (function () {
    function Discussion() {
    }
    /**
     * generate an ID for a message
     */
    Discussion.generateID = function () {
        return "d" + Math.random();
    };
    /**
     * initialization
     */
    Discussion.init = function () {
        document.getElementById("questions").hidden = true;
    };
    /**
     * @description show a dialog box where the user can ask a question
     */
    Discussion.askQuestion = function () {
        var question = prompt("Type your question/comment:");
        if (question == null) //if cancel
            return;
        question = question.trim();
        if (question == "") //if the message is empty
            return;
        Share.execute("questionAdd", [UserManager.me.userID, Discussion.generateID(), question]);
    };
    /**
     *
     * @param questionID
     * @descrption removes the question of ID questionID
     */
    Discussion.removeQuestion = function (questionID) {
        document.getElementById(questionID).remove();
        if (document.getElementById("questions").children.length == 0)
            document.getElementById("questions").hidden = true;
    };
    /**
     *
     * @param userID
     * @param idquestion
     * @param question
     * @description add a question in the pipe.
     */
    Discussion.addQuestion = function (userID, idquestion, question) {
        var questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.id = idquestion;
        questionElement.innerHTML = UserManager.getUserImage(userID).outerHTML + question;
        questionElement.onclick = function () {
            if (UserManager.me.canWrite) { //only users that can write can remove questions
                Share.execute("questionRemove", [questionElement.id]);
            }
        };
        document.getElementById("questions").appendChild(questionElement);
        document.getElementById("questions").hidden = false;
    };
    return Discussion;
}());
//# sourceMappingURL=Discussion.js.map