class Discussion {
    static generateID() {
        return "d" + Math.random();
    }


    static init() {
        document.getElementById("questions").hidden = true;
    }
    static askQuestion() {
        let question = prompt("Type your question/comment:");
        if (question == null)
            return;

        question = question.trim();

        if (question == "")
            return;

        Share.execute("questionAdd", [UserManager.me.userID, Discussion.generateID(), question]);
    }


    static removeQuestion(questionID: string) {
        document.getElementById(questionID).remove();
        if (document.getElementById("questions").children.length == 0)
            document.getElementById("questions").hidden = true;
    }



    static addQuestion(userID: string, idquestion: string, question: string) {
        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.id = idquestion;
        questionElement.innerHTML = UserManager.getUserImage(userID).outerHTML + question;
        questionElement.onclick = () => {
            if (UserManager.me.canWrite) {
                Share.execute("questionRemove", [questionElement.id]);
            }
        }
        document.getElementById("questions").appendChild(questionElement);
        document.getElementById("questions").hidden = false;
    }
}