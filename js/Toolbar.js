var Toolbar = /** @class */ (function () {
    function Toolbar() {
    }
    Toolbar.init = function () {
        if (Layout.isTactileDevice()) {
            document.getElementById("buttonCloseControls").hidden = true; //on phone or tablet, we can not remove the toolbar, therefore the button is hidden
            var spans = document.querySelectorAll("#controls > span");
            for (var i = 0; spans.length; i++) {
                spans[i].hidden = true;
            }
        }
    };
    Toolbar.toggle = function () {
        var controls = document.getElementById("controls");
        controls.hidden = !controls.hidden;
    };
    return Toolbar;
}());
//# sourceMappingURL=Toolbar.js.map