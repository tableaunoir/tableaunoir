export class CircularMenu {

    private container = document.createElement("div");
    public buttons = [];
    static radius = 96;


    constructor() {
        this.container.classList.add("CircularMenu");
        this.container.classList.add("CircularMenuHide");
        this.container.innerHTML = "";
        setTimeout(() =>
            document.getElementById("board").appendChild(this.container), 1000);
    }


    clear() {
        this.container.innerHTML = "";
        this.buttons = [];
    }

    addButton(button: HTMLElement) {
        this.buttons.push(button);
        this.container.appendChild(button);
        button.classList.add("paletteColorButton");
    }


    layout() {
        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.buttons[i];
            const angle = -Math.PI / 2 + 2 * Math.PI * i / this.buttons.length;
            button.style.top = (CircularMenu.radius * Math.sin(angle) - 22) + "px";
            button.style.left = (CircularMenu.radius * Math.cos(angle) - 16) + "px";
        }

    }

    /**
 * @param position a point {x: ..., y: ...}
 * @description show the palette at position position
 */
    show(position: { x: number, y: number }): void {
        CircularMenu.hide();

        position.y = Math.max(position.y, CircularMenu.radius + 32 + 48);
        position.x = Math.max(position.x, CircularMenu.radius + 32 + 48);

        this.container.style.left = position.x + "px";
        this.container.style.top = position.y + "px";
        this.container.classList.remove("CircularMenuHide");
        this.container.classList.add("CircularMenuShow");
    }



    /**
     * @description hide the palette
     */
    static hide(): void {
        const menus = document.getElementsByClassName("CircularMenu");
        for (let i = 0; i < menus.length; i++) {
            menus[i].classList.remove("CircularMenuShow");
            menus[i].classList.add("CircularMenuHide");
        }


    }


    hide(): void {
        this.container.classList.remove("CircularMenuShow");
        this.container.classList.add("CircularMenuHide");
    }


    /**
     * @returns true iff the palette is shown
     */
    isShown(): boolean {
        return this.container.classList.contains("CircularMenuShow");
    }


    /**
     * @returns true iff the palette is shown
     */
    static isShown(): boolean {
        return document.getElementsByClassName("CircularMenuShow").length > 0;
    }
}