var EraserCursor = /** @class */ (function () {
    function EraserCursor() {
    }
    /**
    *
    * @param {*} size
    * @returns the .style.cursor of the canvas if you want to have a cursor that looks like an eraser of size size
    */
    EraserCursor.getStyleCursor = function (size) {
        if (size === void 0) { size = 20; }
        if (size > 128)
            size = 128;
        return { data: EraserCursor.getCursorURL(size), x: size / 2, y: size / 2 };
    };
    /**
     *
     * @param size
     * @returns the URL of the image of the cursor
     */
    EraserCursor.getCursorURL = function (size) {
        var radius = size / 2;
        var canvas = document.createElement('canvas');
        canvas.width = 2 * radius;
        canvas.height = 2 * radius;
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = BoardManager.getBackgroundColor() == "black" ? "white" : "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = BoardManager.getBackgroundColor() == "black" ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)";
        ctx.fill();
        return canvas.toDataURL();
    };
    return EraserCursor;
}());
//# sourceMappingURL=EraserCursor.js.map