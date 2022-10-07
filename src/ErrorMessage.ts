export class ErrorMessage {


    static timer = undefined;

    /**
     *
     * @param msg
     * @param msgplus
     * @description show a message error. The message msg is shown. msgplus is shown in the console.
     */
    static show(msg: string, msgplus?: string): void {
        console.log("error: " + msg);
        if (msgplus) console.log(msgplus);
        document.getElementById("error").hidden = false;
        document.getElementById("error").innerHTML = msg;

        const hide = () => { document.getElementById("error").hidden = true; ErrorMessage.timer = undefined; };
        document.getElementById("error").onclick = hide;

        if (ErrorMessage.timer)
            clearTimeout(ErrorMessage.timer);
        ErrorMessage.timer = setTimeout(hide, 5000);
    }
}
