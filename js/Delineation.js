class Delineation {

    points = [];


    reset() {
        this.points = []
    }

    containsPolygonToMagnetize() {
        return this.points.length > 0;
    }

    addPoint(point) {
        this.points.push(point);
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
        context.strokeStyle = "rgba(255,255,255,1)";
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

    _getDataURLPictureOfRectangle(r) {
        let C = document.createElement("canvas");
        C.width = r.x2 - r.x1;
        C.height = r.y2 - r.y1;
        let ctx = C.getContext("2d");
        ctx.drawImage( document.getElementById("canvas"),
            r.x1, r.y1, r.x2 - r.x1, r.y2 - r.y1, //coordinates in the canvas
            0, 0, r.x2 - r.x1, r.y2 - r.y1); //coordinates in the magnet
        return C.toDataURL();
    }


    _createMagnetFromImg = () => {
        let img = new Image();
        const rectangle = this._getRectangle();
        console.log(rectangle)
        img.src = this._getDataURLPictureOfRectangle(rectangle);
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
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);
        context.restore();
        context.globalCompositeOperation = "source-over";
        this.reset();
    }



}