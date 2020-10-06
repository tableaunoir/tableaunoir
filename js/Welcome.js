class Welcome {
    static init() {
        document.getElementById("start").onclick =
            () => {
                Welcome.hide();
                controls.hidden = true;
            }

        document.getElementById("startButtonMode").onclick =
            () => {
                Welcome.hide();
                controls.hidden = false;
            }
    }


    static isShown() {
        return !help.classList.contains("menuHide");
    }

    static hide() {
        help.classList.remove("menuShow");
        help.classList.add("menuHide");
    }
}