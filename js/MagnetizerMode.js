class MagnetizerMode {

    points = [];
    active = false;

    onpointerdown(evt) {
        this.points.push({x: evt.offsetX, y: evt.offsetY});
        this.active = true;
    }

    onpointermove(evt) {
        if(this.active) {
            this.points.push({x: evt.offsetX, y: evt.offsetY});
        }
    }

    onpointerup(evt) {
        let img = new Image();
        img.src = document.getElementById("canvas").toDataURL();
        img.style.clipPath = "polygon(" + this.points.map(point => `${point.x}px ${point.y}px`).join(", ") + ")";
        MagnetManager.addMagnet(img);
        this.active = false;
    }
}