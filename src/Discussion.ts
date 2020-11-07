class Discussion {
    static askQuestion() {
        const question = prompt("Type the question you want to ask:");
        if(question != null)
            Share.execute("questionAdd", [UserManager.me.userID, question]);
    }


    static addQuestion(userID: string, question: string) {
        const questionElement = document.createElement("div");
        questionElement.classList.add("question");
        questionElement.innerHTML = question;
        questionElement.onclick = () => {questionElement.remove();}
        document.getElementById("questions").appendChild(questionElement);
    }
}