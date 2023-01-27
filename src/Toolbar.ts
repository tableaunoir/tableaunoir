import { AnimationToolBar } from './AnimationToolBar';
import { Layout } from './Layout';
import { ShowMessage } from './ShowMessage';
import { OptionManager } from './OptionManager';


export class Toolbar {

    static isHidden(): boolean {
        return Toolbar.getToolbar().style.display == "none";
    }

    /**
     * initialization
     */
    static init(): void {

        document.getElementById("buttonMovieMode").onclick = AnimationToolBar.toggle;
        document.getElementById("hiddenToolbar").onclick = Toolbar.hideHiddenToolbarMessage;

        if (Layout.isTactileDevice()) {
            try {
                document.getElementById("inputToolbar").hidden = true; //on phone or tablet, we can not remove the toolbar, therefore the checkbox (in the option menu) is hidden

                const spans = document.getElementsByClassName("keyboardkeyhelp");
                for (let i = 0; i < spans.length; i++) {
                    (<HTMLElement>spans[i]).hidden = true;
                }
            }
            catch (e) {
                ShowMessage.error("Error in loading the toolbar. You can however use Tableaunoir.")
            }

        }

        OptionManager.boolean({
            name: "toolbar",
            defaultValue: true,
            onChange: (isToolbar) => {
                if (Layout.isTactileDevice()) //on android etc. the toolbar is ALWAYS visible
                    Toolbar.getToolbar().style.display = undefined;
                else
                    Toolbar.getToolbar().style.display = isToolbar ? "" : "none";
            }
        });



        OptionManager.string({
            name: "toolbarPosition",
            defaultValue: "top",
            onChange: (position) => {
                if (position == "left") Toolbar.left = true;
                if (position == "right") Toolbar.right = true;
                if (position == "bottom") Toolbar.bottom = true;
                if (position == "top") Toolbar.top = true;
            }
        });


        Toolbar.helpButtonDivide();


    }


    private static removeTopBottomEtc() {
        const toolbar = Toolbar.getToolbar();
        toolbar.classList.remove("toolbarTop");
        toolbar.classList.remove("toolbarBottom");
        toolbar.classList.remove("toolbarLeft");
        toolbar.classList.remove("toolbarRight");
    }



    /**
     * 
     * @param v 
     * @param className 
     * @description if v is true, then set the orientation of the toolbar to be like the CSS class className
     * 
     */
    private static setOrientationClass(v: boolean, className: string) {
        if (v) {
            Toolbar.removeTopBottomEtc();
            const toolbar = Toolbar.getToolbar();
            toolbar.classList.add(className);
            Layout.layout();
        }
    }







    static get top(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarTop");
    }

    static set top(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarTop");
    }

    static get bottom(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarBottom");
    }

    static set bottom(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarBottom");
    }

    static get left(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarLeft");
    }

    static set left(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarLeft");
    }

    static get right(): boolean {
        return Toolbar.getToolbar().classList.contains("toolbarRight");
    }


    static set right(v: boolean) {
        Toolbar.setOrientationClass(v, "toolbarRight");
    }




    /**
     * help animation for divide the screen
     */
    static helpButtonDivide(): void {
        const divideLine = document.createElement("div");
        divideLine.className = "divideLineHelp";

        document.getElementById("buttonDivide").onmouseenter = () => {
            divideLine.style.left = "" + Layout.getXMiddle() + "px";
            document.getElementById("board").prepend(divideLine);
        };
        document.getElementById("buttonDivide").onmouseleave = () => {
            divideLine.remove();
        };
    }



    static getToolbar(): HTMLElement { return document.getElementById("controls"); }

    /**
     * @description toogle the visibility of the toolbar
     */
    static toggle(): void {
        const controls = Toolbar.getToolbar();
        if (controls.style.display == "") {
            controls.style.display = "none";
            Toolbar.showHiddenToolbarMessage();
        }

        else {
            Toolbar.hideHiddenToolbarMessage();
            controls.style.display = "";
        }

        Layout.layout();
    }



    static hideHiddenToolbarMessage(): void {
        document.getElementById("hiddenToolbar").hidden = true;
    }


    static timerHiddenToolbarMessage = undefined;

    static showHiddenToolbarMessage(): void {
        document.getElementById("hiddenToolbar").hidden = false;
        if (Toolbar.timerHiddenToolbarMessage)
            clearTimeout(Toolbar.timerHiddenToolbarMessage);

        Toolbar.timerHiddenToolbarMessage = setTimeout(Toolbar.hideHiddenToolbarMessage, 3000);
    }
}
