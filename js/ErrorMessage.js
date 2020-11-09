var ErrorMessage = /** @class */ (function () {
    function ErrorMessage() {
    }
    /**
     *
     * @param msg
     * @param msgplus
     * @description show a message error. The message msg is shown. msgplus is shown in the console.
     */
    ErrorMessage.show = function (msg, msgplus) {
        console.log("error: " + msg);
        if (msgplus)
            console.log(msgplus);
        document.getElementById("error").hidden = false;
        document.getElementById("error").innerHTML = msg;
        var hide = function () { document.getElementById("error").hidden = true; };
        document.getElementById("error").onclick = hide;
        setInterval(hide, 5000);
    };
    return ErrorMessage;
}());
//# sourceMappingURL=ErrorMessage.js.map