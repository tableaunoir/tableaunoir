import { CircularMenu } from './CircularMenu';
import { ChalkCursor } from './ChalkCursor';
import { OptionManager } from './OptionManager';
import { standard, crazy } from './Palettes';
import type { PaletteNames } from './Palettes';

/**
 * the circular palette
 */
export class Palette extends CircularMenu {

    private palettes: { standard: string[], crazy: string[] } = {
        standard, crazy
    }

    /** colors that can have a chalk. The first color *must* be white */
    private colors: string[] = standard;

    private currentColorID = 0;
    onchange: () => void = () => {
        //empty function
    };


    constructor() {
        super();
        setTimeout(() => OptionManager.string({
            name: "palette",
            defaultValue: "standard",
            onChange: (newPaletteName: PaletteNames ) => {
                this.colors = this.palettes[newPaletteName];
                this.currentColorID = 0;
                this._createPalette();
            }
        }), 1000);
        this._createPalette();
    }

    /**
     * @descrition create (the DOM elements of) the palette
     */
    private _createPalette(): void {
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
        this.colors = this.colors.map((color) => color == "white" ? "black" : color == "black" ? "white" : color);
        //exchange white and black in the colors

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
            if (this.buttons[this.currentColorID]) //the button may not be here because we switch to another palette
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
     * 
     * @param position 
     * @description show the palette
     */
    show(position: { x: number, y: number }): void {
        super.show(position);
        this._createPalette(); //we recreate the palette because we do not know the leftHanded thing
    }

    /**
     * @returns the selected color
     */
    getCurrentColor(): string { return this.colors[this.currentColorID]; }
}
