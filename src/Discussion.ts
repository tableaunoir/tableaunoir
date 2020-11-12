/**
 * Discussion (students that can ask questions, make comments)
 * The message appears at the bottom of the page
 */
class Discussion {

    /**
     * generate an ID for a message
     */
    static generateID() {
        return "d" + Math.random();
    }

    /**
     * initialization
     */
    static init() {
        document.getElementById("questions").hidden = true;
    }



    /**
     * @description show a dialog box where the user can ask a question
     */
    static askQuestion() {
        let question = prompt("Type your question/comment:");

        if (question == null) //if cancel
            return;

        question = question.trim();

        if (question == "") //if the message is empty
            return;

        Share.execute("questionAdd", [UserManager.me.userID, Discussion.generateID(), question]);
    }


    /**
     * 
     * @param questionID 
     * @descrption removes the question of ID questionID
     */
    static removeQuestion(questionID: string) {
        document.getElementById(questionID).remove();
        if (document.getElementById("questions").children.length == 0)
            document.getElementById("questions").hidden = true;
    }


    /**
     * 
     * @param userID 
     * @param idquestion 
     * @param question 
     * @description add a question in the pipe.
     */
    static addQuestion(userID: string, idquestion: string, question: string) {
        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.id = idquestion;
        questionElement.innerHTML = UserManager.getUserImage(userID).outerHTML + question;
        questionElement.onclick = () => {
            if (UserManager.me.canWrite) { //only users that can write can remove questions
                Share.execute("questionRemove", [questionElement.id]);
            }
        }
        document.getElementById("questions").appendChild(questionElement);
        document.getElementById("questions").hidden = false;
    }
}