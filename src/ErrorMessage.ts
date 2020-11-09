class ErrorMessage {

    /**
     * 
     * @param msg 
     * @param msgplus 
     * @description show a message error. The message msg is shown. msgplus is shown in the console.
     */
    static show(msg, msgplus?) {
        console.log("error: " + msg);
        if (msgplus) console.log(msgplus);
        document.getElementById("error").hidden = false;
        document.getElementById("error").innerHTML = msg;

        const hide = () => { document.getElementById("error").hidden = true };
        document.getElementById("error").onclick = hide;
        setInterval(hide, 5000);
    }
}