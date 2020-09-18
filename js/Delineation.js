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


    _createMagnetFromImg = () => {
        let img = new Image();
        img.src = document.getElementById("canvas").toDataURL();
        img.style.clipPath = "polygon(" + this.points.map(point => `${point.x}px ${point.y}px`).join(", ") + ")";
        MagnetManager.addMagnet(img);
        img.style.left = "0px";
        img.style.top = "0px";
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