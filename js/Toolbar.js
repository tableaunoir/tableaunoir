class Toolbar {
    static init() {
        if (Layout.isTactileDevice()) {
            buttonCloseControls.hidden = true; //on phone or tablet, we can not remove the toolbar, therefore the button is hidden

            for(let o of document.querySelectorAll("#controls > span")) {
                o.hidden = true;
            }
                
        }
    }




    static toggle() {
        controls.hidden = !controls.hidden;
    }
}