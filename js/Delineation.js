/**
 * This class represents a polyline drawn by a user
 */
var Delineation = /** @class */ (function () {
    function Delineation() {
        var _this = this;
        this.points = [];
        this.lastpoints = [];
        this.maybeJustAPoint = true; //memoisation for getDot
        this._removeContour = function () {
            var canvas = getCanvas();
            var context = canvas.getContext("2d");
            context.globalCompositeOperation = "destination-out";
            context.strokeStyle = "rgba(255, 255, 255, 1)";
            context.lineWidth = 6;
            context.globalAlpha = 1.0;
            context.moveTo(_this.points[0].x, _this.points[0].y);
            for (var _i = 0, _a = _this.points; _i < _a.length; _i++) {
                var point = _a[_i];
                context.lineTo(point.x, point.y);
            }
            context.stroke();
        };
        this._createMagnetFromImg = function () {
            var img = new Image();
            var rectangle = _this._getRectangle();
            console.log(rectangle);
            //BoardManager._toBlobOfRectangle(rectangle, (blob) => img.src = URL.createObjectURL(blob));
            img.src = BoardManager.getDataURLOfRectangle(rectangle);
            img.style.clipPath = "polygon(" + _this.points.map(function (point) { return point.x - rectangle.x1 + "px " + (point.y - rectangle.y1) + "px"; }).join(", ") + ")";
            MagnetManager.addMagnet(img);
            img.style.left = rectangle.x1 + "px";
            img.style.top = rectangle.y1 + "px";
        };
        this._clearBehindMagnet = function () {
            var context = getCanvas().getContext("2d");
            context.save();
            context.beginPath();
            context.moveTo(_this.points[0].x, _this.points[0].y);
            for (var _i = 0, _a = _this.points; _i < _a.length; _i++) {
                var point = _a[_i];
                context.lineTo(point.x, point.y);
            }
            context.clip();
            context.clearRect(0, 0, Layout.getWindowWidth(), Layout.getWindowHeight());
            context.restore();
            context.globalCompositeOperation = "source-over";
            _this.reset();
        };
    }
    Delineation.prototype.reset = function () {
        this.drawing = true;
        this.lastpoints = this.points;
        this.points = [];
        this.maybeJustAPoint = true;
    };
    Delineation.prototype.finish = function () {
        this.drawing = false;
        this.removePolygon();
    };
    /**
     * @returns true if the set of current points is non-empty
     */
    Delineation.prototype.isDrawing = function () {
        return this.points.length > 0;
    };
    Delineation.prototype.containsPolygonToMagnetize = function () {
        return this.points.length > 0;
    };
    Delineation.prototype.drawPolygon = function (points) {
        if (document.getElementById("magnetCreationPolygon"))
            return;
        var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.id = "magnetCreationPolygon";
        document.getElementById("svg").appendChild(polyline);
        points.push(points[0]);
        polyline.setAttribute("points", points.map(function (p) { return p.x + ", " + p.y; }).join(" "));
    };
    Delineation.prototype.removePolygon = function () {
        if (document.getElementById("magnetCreationPolygon"))
            document.getElementById("svg").removeChild(document.getElementById("magnetCreationPolygon"));
    };
    Delineation.prototype.addPoint = function (point) {
        var _this = this;
        this.points.push(point);
        if (this.isDot() && this.dotInPreviousPolygon()) {
            this.drawPolygon(this.lastpoints);
            window.setTimeout(function () {
                if (_this.drawing && _this.isDot() && _this.dotInPreviousPolygon()) {
                    _this.removePolygon();
                    _this._removeContour(); //remove the dot
                    _this.points = _this.lastpoints;
                    _this.lastpoints = [];
                    _this.cutAndMagnetize();
                }
            }, 1000);
        }
        else
            this.removePolygon();
    };
    /**
     * @returns true if the current drawing is just a point
     */
    Delineation.prototype.isDot = function () {
        if (!this.maybeJustAPoint)
            return false;
        if (this.points.length == 0)
            return false;
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            if (Math.abs(point.x - this.points[0].x) > 2 && Math.abs(point.y - this.points[0].y) > 2) {
                this.maybeJustAPoint = false;
                return false;
            }
        }
        return true;
    };
    /**
     *
     * @param {*} point
     * @param {*} polygon
     * @returns true iff the point is inside the polygon
     */
    Delineation.inPolygon = function (point, polygon) {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
        var x = point.x, y = point.y;
        var inside = false;
        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i].x, yi = polygon[i].y;
            var xj = polygon[j].x, yj = polygon[j].y;
            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect)
                inside = !inside;
        }
        return inside;
    };
    Delineation.prototype.dotInPreviousPolygon = function () {
        return Delineation.inPolygon(this.points[0], this.lastpoints);
    };
    Delineation.prototype.erase = function () {
        if (!this.isSuitable())
            return;
        this._removeContour();
        this._clearBehindMagnet();
        BoardManager.save();
    };
    /**
     * @description magnetize the "selected" part of the blackboard. The selected part is also removed.
     */
    Delineation.prototype.cutAndMagnetize = function () {
        if (!this.isSuitable())
            return;
        this._removeContour();
        this._createMagnetFromImg();
        this._clearBehindMagnet();
        BoardManager.save();
    };
    /**
    * @description magnetize the "selected" part of the blackboard.
    */
    Delineation.prototype.copyAndMagnetize = function () {
        if (!this.isSuitable())
            return;
        this._removeContour();
        this._createMagnetFromImg();
        BoardManager.save();
    };
    Delineation.prototype.isSuitable = function () {
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            if (Math.abs(point.x - this.points[0].x) > 16 &&
                Math.abs(point.x - this.points[0].x) > 16)
                return true;
        }
        return false;
    };
    Delineation.prototype._getRectangle = function () {
        var canvas = getCanvas();
        var r = { x1: canvas.width, y1: canvas.height, x2: 0, y2: 0 };
        for (var _i = 0, _a = this.points; _i < _a.length; _i++) {
            var point = _a[_i];
            r.x1 = Math.min(r.x1, point.x);
            r.y1 = Math.min(r.y1, point.y);
            r.x2 = Math.max(r.x2, point.x);
            r.y2 = Math.max(r.y2, point.y);
        }
        return r;
    };
    return Delineation;
}());
//# sourceMappingURL=Delineation.js.map