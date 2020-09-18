class Palette {
    colors = ["white", "yellow", "orange", "rgb(100, 172, 255)", "Crimson", "Plum", "LimeGreen"];
    buttons = [];
    currentColorID = 0;
    onchange = () => { };

    createPalette() {
        const div = document.getElementById("palette");
        for (let i in this.colors) {
            this.buttons[i] = this.createColorButton(i);
            div.appendChild(this.buttons[i]);
        }
    }

    createColorButton(i) {
        const img = new Image();
        img.src = ChalkCursor.getCursorURL(this.colors[i]);
        img.classList.add("paletteColorButton");

        let angle = -Math.PI / 2 + 2 * Math.PI * i / this.colors.length;
        let radius = 96;
        img.style.top = (radius * Math.sin(angle) - 22) + "px";
        img.style.left = (radius * Math.cos(angle) - 16) + "px";
        img.onclick = () => {
            this.buttons[this.currentColorID].classList.remove("selected");
            this.currentColorID = i;
            this.buttons[this.currentColorID].classList.add("selected");
            this.hide();
            this.onchange();
        }
        return img;
    }

    next() {
        this.buttons[this.currentColorID].classList.remove("selected");
        this.currentColorID++;
        this.currentColorID = this.currentColorID % this.colors.length;
        this.buttons[this.currentColorID].classList.add("selected");
        this.onchange();
    }


    show(position) {
        const div = document.getElementById("palette");
        div.style.left = position.x + "px";
        div.style.top = position.y + "px";
        div.style.visibility = "visible";
    }

    hide() {
        const div = document.getElementById("palette");
        div.style.visibility = "hidden";
    }

    isShown() {
        return (document.getElementById("palette").style.visibility == "visible");
    }

    getCurrentColor() {
        return this.colors[this.currentColorID];
    }
}