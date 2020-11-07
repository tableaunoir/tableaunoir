var ErrorMessage = /** @class */ (function () {
    function ErrorMessage() {
    }
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