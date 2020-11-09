class Menu {

    /**
     * initialization
     */
    static init() {
        // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").click();
    }


    /**
     * 
     * @param pageName 
     * @param elmnt 
     * @description open the page of name pageName
     */
    static openPage(pageName: string, elmnt) {
        // Hide all elements with class="tabcontent" by default */
        var i, tabcontent, tablinks;
        tabcontent = document.getElementsByClassName("tabcontent");
        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }

        // Remove the background color of all tablinks/buttons
        tablinks = document.getElementsByClassName("tablink");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].classList.remove("selected");
        }

        // Show the specific tab content
        document.getElementById(pageName).style.display = "block";

        // Add the specific color to the button used to open the tab content
        elmnt.classList.add("selected");
    }

    /**
     * @description if the menu is shown, hide it. If it is invisible, show it!
     */
    static toggle() {
        if (Menu.isShown()) {
            Menu.hide();
        }
        else {
            Menu.show();
        }
    }


    /**
     * @return the menu panel
     */
    static getMenu() {
        return document.getElementById("menu");
    }


    /**
     * @description hide
     */
    static hide() {
        Menu.getMenu().classList.remove("menuShow");
        Menu.getMenu().classList.add("menuHide");
    }

    /**
    * @description show
    */
    static show() {
        Menu.getMenu().classList.add("menuShow");
        Menu.getMenu().classList.remove("menuHide");
    }


    /**
     * @returns true iff the menu is shown
     */
    static isShown() { return Menu.getMenu().classList.contains("menuShow"); }
}