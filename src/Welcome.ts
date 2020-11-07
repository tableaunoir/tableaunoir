class Welcome {
    static init() {
        document.getElementById("welcome").onclick = Welcome.hide;
    }

    static isShown() {
        return !document.getElementById("welcome").classList.contains("menuHide");
    }

    static hide() {
        document.getElementById("welcome").classList.remove("menuShow");
        document.getElementById("welcome").classList.add("menuHide");
    }
}