class Toolbar {


    /**
     * initialization
     */
    static init() {
        if (Layout.isTactileDevice()) {
            try {
                document.getElementById("buttonCloseControls").hidden = true; //on phone or tablet, we can not remove the toolbar, therefore the button is hidden

                const spans = <NodeListOf<HTMLSpanElement>>document.querySelectorAll("#controls > span");
                for (let i = 0; i < spans.length; i++) {
                    spans[i].hidden = true;
                }
            }
            catch (e) {
                ErrorMessage.show("Error in loading the toolbar. You can however use Tableaunoir.")
            }

        }
    }



    /**
     * @description toogle the visibility of the toolbar
     */
    static toggle() {
        const controls = document.getElementById("controls");
        controls.hidden = !controls.hidden;
    }
}