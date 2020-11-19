import { ChalkCursor } from './ChalkCursor';

/**
 * the circular palette
 */
export class Palette {
    /** colors that can have a chalk. The first color *must* be white */
    colors = ["white", "yellow", "orange", "rgb(100, 172, 255)", "Crimson", "Plum", "LimeGreen"];


    buttons = [];
    currentColorID = 0;
    onchange: () => void = () => { };


    static radius = 96;

    /**
     * @descrition create (the DOM elements of) the palette
     */
    _createPalette(): void {
        const div = document.getElementById("palette");
        for (let i = 0; i < this.colors.length; i++) {
            this.buttons[i] = this._createColorButton(i);
            div.appendChild(this.buttons[i]);
        }
    }

    /**
     * @description switch the first color (white <=> black)
     */
    switchBlackAndWhite(): void {
        this.colors[0] = (this.colors[0] == "white") ? "black" : "white";
        this.onchange();
    }

    /**
     *
     * @param {*} i  an index between 0 and this.colors.length - 1
     * @description create the button for the color of index i
     */
    _createColorButton(i: number): HTMLImageElement {
        const img = new Image();
        img.src = ChalkCursor.getCursorURL(this.colors[i]);
        img.classList.add("paletteColorButton");

        const angle = -Math.PI / 2 + 2 * Math.PI * i / this.colors.length;

        img.style.top = (Palette.radius * Math.sin(angle) - 22) + "px";
        img.style.left = (Palette.radius * Math.cos(angle) - 16) + "px";
        img.style.borderColor = this.colors[i];

        img.onmousedown = (evt) => { evt.preventDefault(); } //to prevent the drag and drop of the image of the chalk

        img.onclick = () => {
            this.buttons[this.currentColorID].classList.remove("selected");
            this.currentColorID = i;
            this.buttons[this.currentColorID].classList.add("selected");
            this.hide();
            this.onchange();
        }
        return img;
    }

    /**
     * @description select the next color
     */
    next(): void {
        this.buttons[this.currentColorID].classList.remove("selected");
        this.currentColorID++;
        this.currentColorID = this.currentColorID % this.colors.length;
        this.buttons[this.currentColorID].classList.add("selected");
        this.onchange();
    }

    /**
     * @description select the previous color
     */
    previous(): void {
        this.buttons[this.currentColorID].classList.remove("selected");
        this.currentColorID--;
        if (this.currentColorID < 0)
            this.currentColorID = this.colors.length - 1;
        this.buttons[this.currentColorID].classList.add("selected");
        this.onchange();
    }

    /**
     * @param position a point {x: ..., y: ...}
     * @description show the palette at position position
     */
    show(position: { x, y }): void {
        const div = document.getElementById("palette");
        div.innerHTML = "";
        this._createPalette();

        position.y = Math.max(position.y, Palette.radius + 16 + 48);
        position.x = Math.max(position.x, Palette.radius + 16 + 48);

        div.style.left = position.x + "px";
        div.style.top = position.y + "px";
        div.classList.remove("PaletteHide");
        div.classList.add("PaletteShow");
    }

    /**
     * @description hide the palette
     */
    hide(): void {
        const div = document.getElementById("palette");
        div.classList.remove("PaletteShow");
        div.classList.add("PaletteHide");
    }

    /**
     * @returns true iff the palette is shown
     */
    isShown(): boolean {
        return document.getElementById("palette").classList.contains("PaletteShow");
    }

    /**
     * @returns the selected color
     */
    getCurrentColor(): string {
        return this.colors[this.currentColorID];
    }
}
