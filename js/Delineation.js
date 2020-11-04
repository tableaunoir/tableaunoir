/**
 * This class represents a polyline drawn by a user
 */
class Delineation {

    points = [];
    lastpoints = [];

    reset() {
        this.drawing = true;
        this.lastpoints = this.points;
        this.points = [];
    }

    finish() {
        this.drawing = false;
        this.removePolygon();
    }
    /**
     * @returns true if the set of current points is non-empty
     */
    isDrawing() {
        return this.points.length > 0;
    }

    containsPolygonToMagnetize() {
        return this.points.length > 0;
    }

    drawPolygon(points) {
        if (document.getElementById("magnetCreationPolygon"))
            return;

        let polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.id = "magnetCreationPolygon";
        svg.appendChild(polyline);

        points.push(points[0]);
        polyline.setAttribute("points", points.map((p) => p.x + ", " + p.y).join(" "));
    }

    removePolygon() {
        if (document.getElementById("magnetCreationPolygon"))
            svg.removeChild(document.getElementById("magnetCreationPolygon"));
    }


    addPoint(point) {
        this.points.push(point);

        if (this.isDot() && this.dotInPreviousPolygon()) {
            this.drawPolygon(this.lastpoints);

            window.setTimeout(() => {
                if (this.drawing && this.isDot() && this.dotInPreviousPolygon()) {
                    this.removePolygon();
                    this._removeContour(); //remove the dot
                    this.points = this.lastpoints;
                    this.lastpoints = [];
                    this.cutAndMagnetize();
                }
            }, 1000);
        }
        else
            this.removePolygon();

    }

    /**
     * @returns true if the current drawing is just a point
     */
    isDot() {
        if (this.points.length == 0)
            return false;

        for (let point of this.points)
            if (Math.abs(point.x - this.points[0].x) > 2 && Math.abs(point.y - this.points[0].y) > 2)
                return false;

        return true;
    }

    /**
     * 
     * @param {*} point 
     * @param {*} polygon 
     * @returns true iff the point is inside the polygon
     */
    static inPolygon(point, polygon) {
        // ray-casting algorithm based on
        // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html

        var x = point.x, y = point.y;

        var inside = false;
        for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            var xi = polygon[i].x, yi = polygon[i].y;
            var xj = polygon[j].x, yj = polygon[j].y;

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    }

    dotInPreviousPolygon() {
        return Delineation.inPolygon(this.points[0], this.lastpoints);
    }

    erase() {
        if (!this.isSuitable())
            return;

        this._removeContour();
        this._clearBehindMagnet();
        BoardManager.save();
    }


    /**
     * @description magnetize the "selected" part of the blackboard. The selected part is also removed.
     */
    cutAndMagnetize() {
        if (!this.isSuitable())
            return;

        this._removeContour();
        this._createMagnetFromImg();
        this._clearBehindMagnet();
        BoardManager.save();
    }


    /**
    * @description magnetize the "selected" part of the blackboard.
    */
    copyAndMagnetize() {
        if (!this.isSuitable())
            return;

        this._removeContour();
        this._createMagnetFromImg();
        BoardManager.save();
    }




    isSuitable() {
        for (let point of this.points) {
            if (Math.abs(point.x - this.points[0].x) > 16 &&
                Math.abs(point.x - this.points[0].x) > 16)
                return true;
        }
        return false;
    }

    _removeContour = () => {
        const context = document.getElementById("canvas").getContext("2d");
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(255, 255, 255, 1)";
        context.lineWidth = 6;
        context.globalAlpha = 1.0;


        context.moveTo(this.points[0].x, this.points[0].y);
        for (let point of this.points) {
            context.lineTo(point.x, point.y);
        }
        context.stroke();
    }

    _getRectangle() {
        let r = { x1: canvas.width, y1: canvas.height, x2: 0, y2: 0 };

        for (let point of this.points) {
            r.x1 = Math.min(r.x1, point.x);
            r.y1 = Math.min(r.y1, point.y);
            r.x2 = Math.max(r.x2, point.x);
            r.y2 = Math.max(r.y2, point.y);
        }

        return r;
    }




    _createMagnetFromImg = () => {
        let img = new Image();
        const rectangle = this._getRectangle();
        console.log(rectangle)
        //BoardManager._toBlobOfRectangle(rectangle, (blob) => img.src = URL.createObjectURL(blob));
        img.src = BoardManager.getDataURLOfRectangle(rectangle);
        img.style.clipPath = "polygon(" + this.points.map(point => `${point.x - rectangle.x1}px ${point.y - rectangle.y1}px`).join(", ") + ")";
        MagnetManager.addMagnet(img);
        img.style.left = rectangle.x1 + "px";
        img.style.top = rectangle.y1 + "px";
    }

    _clearBehindMagnet = () => {
        const context = document.getElementById("canvas").getContext("2d");
        context.save();
        context.beginPath();
        context.moveTo(this.points[0].x, this.points[0].y);
        for (let point of this.points) {
            context.lineTo(point.x, point.y);
        }
        context.clip();
        context.clearRect(0, 0, Layout.getWindowWidth(), Layout.getWindowHeight());
        context.restore();
        context.globalCompositeOperation = "source-over";
        this.reset();
    }



}