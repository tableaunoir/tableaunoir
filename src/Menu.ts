export class Menu {

    /**
     * initialization
     */
    static init(): void {
        // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").click();
    }


    /**
     *
     * @param pageName
     * @param elmnt
     * @description open the page of name pageName
     * @example Menu.openPage('MyBlackboard', this)
     */
    private static openPage(pageName: string, elmnt: HTMLElement): void {
        // Hide all elements with class="tabcontent" by default */
        const tabcontent = document.getElementsByClassName("tabcontent");
        for (let i = 0; i < tabcontent.length; i++) {
            (<HTMLElement>tabcontent[i]).style.display = "none";
        }

        // Remove the background color of all tablinks/buttons
        const tablinks = document.getElementsByClassName("tablink");
        for (let i = 0; i < tablinks.length; i++) {
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
    static toggle(): void {
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
    static getMenu(): HTMLElement {
        return document.getElementById("menu");
    }


    /**
     * @description hide
     */
    static hide(): void {
        Menu.getMenu().classList.remove("menuShow");
        Menu.getMenu().classList.add("menuHide");
        if (document.activeElement instanceof HTMLElement)
            document.activeElement.blur();
    }

    /**
    * @description show
    */
    static show(): void {
        Menu.getMenu().classList.add("menuShow");
        Menu.getMenu().classList.remove("menuHide");


    }


    static openPageShare(): void {
        Menu.openPage("Share", document.getElementById("tabShare"));
    }


    static openPageMyBoard(): void {
        Menu.openPage("MyBlackboard", document.getElementById("defaultOpen"));
    }

    /**
     * @returns true iff the menu is shown
     */
    static isShown(): boolean { return Menu.getMenu().classList.contains("menuShow"); }
}
