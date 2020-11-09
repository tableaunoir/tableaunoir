var Toolbar = /** @class */ (function () {
    function Toolbar() {
    }
    /**
     * initialization
     */
    Toolbar.init = function () {
        if (Layout.isTactileDevice()) {
            try {
                document.getElementById("buttonCloseControls").hidden = true; //on phone or tablet, we can not remove the toolbar, therefore the button is hidden
                var spans = document.querySelectorAll("#controls > span");
                for (var i = 0; i < spans.length; i++) {
                    spans[i].hidden = true;
                }
            }
            catch (e) {
                ErrorMessage.show("Error in loading the toolbar. You can however use Tableaunoir.");
            }
        }
    };
    /**
     * @description toogle the visibility of the toolbar
     */
    Toolbar.toggle = function () {
        var controls = document.getElementById("controls");
        controls.hidden = !controls.hidden;
    };
    return Toolbar;
}());
//# sourceMappingURL=Toolbar.js.map