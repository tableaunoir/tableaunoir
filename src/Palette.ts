import { CircularMenu } from './CircularMenu';
import { ChalkCursor } from './ChalkCursor';

/**
 * the circular palette
 */
export class Palette extends CircularMenu {
    /** colors that can have a chalk. The first color *must* be white */
    colors = ["white", "yellow", "orange", "rgb(100, 172, 255)", "Crimson", "Plum", "LimeGreen"];


    currentColorID = 0;
    onchange: () => void = () => { };


    constructor() {
        super();
        this._createPalette();
    }

    /**
     * @descrition create (the DOM elements of) the palette
     */
    _createPalette(): void {
        this.clear();
        for (let i = 0; i < this.colors.length; i++) {
            this.addButton(this._createColorButton(i));
        }
        this.layout();
    }

    /**
     * @description switch the first color (white <=> black)
     */
    switchBlackAndWhite(): void {
        this.colors[0] = (this.colors[0] == "white") ? "black" : "white";
        this._createPalette();
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

        img.style.borderColor = this.colors[i];

        img.onclick = () => {
            this.buttons[this.currentColorID].classList.remove("selected");
            this.currentColorID = i;
            this.buttons[this.currentColorID].classList.add("selected");
            CircularMenu.hide();
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
     * @returns the selected color
     */
    getCurrentColor(): string {
        return this.colors[this.currentColorID];
    }
}
