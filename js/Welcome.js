class Welcome {
    static init() {
       document.getElementById("welcome").onclick = Welcome.hide;
    }

    static isShown() {
        return !welcome.classList.contains("menuHide");
    }

    static hide() {
        welcome.classList.remove("menuShow");
        welcome.classList.add("menuHide");
    }
}