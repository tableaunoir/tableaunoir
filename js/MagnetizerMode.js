class MagnetizerMode {

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

    copyAndMagnetize() {
        this._magnetize(false);
    }

    cutAndMagnetize() {
        this._magnetize(true);
    }

    /**
     * 
     * @param {*} a Boolean cut 
     * @description magnetize the "selected" part of the blackboard. If cut is true, the selected part is also removed.
     */
    _magnetize(cut) {
        const context = document.getElementById("canvas").getContext("2d");

        const isSuitable = () => {
            for (let point of this.points) {
                if (Math.abs(point.x - this.points[0].x) > 16 &&
                    Math.abs(point.x - this.points[0].x) > 16)
                    return true;
            }
            return false;
        }
        const removeContour = () => {
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

        const createMagnetFromImg = () => {
            let img = new Image();
            img.src = document.getElementById("canvas").toDataURL();
            img.style.clipPath = "polygon(" + this.points.map(point => `${point.x}px ${point.y}px`).join(", ") + ")";
            MagnetManager.addMagnet(img);
            img.style.left = "0px";
            img.style.top = "0px";
        }

        const clearBehindMagnet = () => {
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
            BoardManager.save();
            this.reset();
        }

        if (!isSuitable())
            return;

        removeContour();
        createMagnetFromImg();

        if (cut)
            clearBehindMagnet();

    }
}