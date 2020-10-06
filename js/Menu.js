class Menu {
    static toggle() {
        if(menu.classList.contains("menuShow")) {
            menu.classList.remove("menuShow");
            menu.classList.add("menuHide");
        }
        else {
            menu.classList.add("menuShow");
            menu.classList.remove("menuHide");
        }
    }


    static hide() {
        menu.classList.remove("menuShow");
        menu.classList.add("menuHide");
    }


    static isShown() {
        return menu.classList.contains("menuShow");
    }
}