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
        Toolbar.helpButtonDivide();
        Toolbar.helpForButtonCloseControls();
    };
    /**
     * help animation for hiding the toolbar
     */
    Toolbar.helpForButtonCloseControls = function () {
        document.getElementById("buttonCloseControls").onmouseenter = function () { Toolbar.getToolbar().style.opacity = "0.5"; };
        document.getElementById("buttonCloseControls").onmouseleave = function () { Toolbar.getToolbar().style.opacity = "1"; };
    };
    /**
     * help animation for divide the screen
     */
    Toolbar.helpButtonDivide = function () {
        var divideLine = document.createElement("div");
        divideLine.className = "divideLineHelp";
        document.getElementById("buttonDivide").onmouseenter = function () {
            divideLine.style.left = "" + Layout.getXMiddle();
            document.getElementById("board").prepend(divideLine);
        };
        document.getElementById("buttonDivide").onmouseleave = function () {
            divideLine.remove();
        };
    };
    Toolbar.getToolbar = function () {
        return document.getElementById("controls");
    };
    /**
     * @description toogle the visibility of the toolbar
     */
    Toolbar.toggle = function () {
        var controls = Toolbar.getToolbar();
        controls.hidden = !controls.hidden;
        Layout._resize();
    };
    return Toolbar;
}());
//# sourceMappingURL=Toolbar.js.map