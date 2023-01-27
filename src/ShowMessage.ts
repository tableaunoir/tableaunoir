export class ShowMessage {
    static timer = undefined;

    /**
   *
   * @param msg
   * @param msgplus
   * @description show a message error. The message msg is shown. msgplus is shown in the console.
   */
    static show(msg: string): void {
        ShowMessage._msg("msg", msg);
    }

    /**
   *
   * @param msg
   * @param msgplus
   * @description show a message error. The message msg is shown. msgplus is shown in the console.
   */
    static error(msg: string, msgplus?: string): void {
        console.log("error: " + msg);
        if (msgplus) console.log(msgplus);

        ShowMessage._msg("error", msg);
    }


    /**
     *
     * @param msg
     * @param msgplus
     * @description show a message error. The message msg is shown. msgplus is shown in the console.
     */
    private static _msg(type: string, msg: string): void {
        const el = document.getElementById("msg");

        el.hidden = false;
        el.innerHTML = msg;
        el.classList.remove("error");
        el.classList.remove("msg");

        setTimeout(() => el.classList.add(type), 0);

        const hide = () => { el.hidden = true; ShowMessage.timer = undefined; };
        el.onclick = hide;

        if (ShowMessage.timer)
            clearTimeout(ShowMessage.timer);
        ShowMessage.timer = setTimeout(hide, 3000);
    }
}
