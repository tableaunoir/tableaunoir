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

    magnetize() {
        const ctx = document.getElementById("canvas").getContext("2d");

        ctx.strokeStyle = "black";
        ctx.lineWidth = 6;
        ctx.globalAlpha = 1.0;

        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();

        let img = new Image();
        img.src = document.getElementById("canvas").toDataURL();
        img.style.clipPath = "polygon(" + this.points.map(point => `${point.x}px ${point.y}px`).join(", ") + ")";
        MagnetManager.addMagnet(img);
        this.active = false;

        ctx.fillStyle = "black";
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let point of this.points) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.fill();

        BoardManager.save();
        this.reset();
    }
}