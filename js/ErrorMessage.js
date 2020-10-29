class ErrorMessage {

    static show(msg, msgplus) {
        console.log("error: " + msg);
        if (msgplus) console.log(msgplus);
        document.getElementById("error").hidden = false;
        document.getElementById("error").innerHTML = msg;

        const hide = () => { document.getElementById("error").hidden = true };
        document.getElementById("error").onclick = hide;
        setInterval(hide, 5000);
    }
}