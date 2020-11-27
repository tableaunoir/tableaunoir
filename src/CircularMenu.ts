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


    clear(): void {
        this.container.innerHTML = "";
        this.buttons = [];
    }

    /**
     * 
     * @param button 
     * @description add a button to the circular menu
     */
    addButton(button: HTMLElement): void {
        this.buttons.push(button);
        this.container.appendChild(button);
        button.onmousedown = (evt) => { evt.preventDefault(); } //to prevent the drag and drop of the image
        button.classList.add("paletteColorButton");
    }

    /**
     * 
     * @param {src, title, onclick}
     * @description add a image button whose image is given by its source src, the hint is title, and onclick is
     * the function to execute when you click
     * 
     */
    addButtonImage({src, title, onclick}: {src: string, title: string, onclick: () => void}) : void {
        const buttonImage = new Image();
        buttonImage.src = src;
        buttonImage.title = title;
        this.addButton(buttonImage);
        buttonImage.onclick = onclick;
    }
        



    layout(): void {

        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.buttons[i];
            const r = this.buttons.length <= 8 ? CircularMenu.radius : CircularMenu.radius + i * 48 / 8;
            const angle = this.buttons.length <= 8 ? -Math.PI / 2 + 2 * Math.PI * i / this.buttons.length
                                                  : -Math.PI / 2 + 2 * Math.PI * Math.pow(i, 0.8) / 8;
            
            button.style.top = (r * Math.sin(angle) - 22) + "px";
            button.style.left = (r * Math.cos(angle) - 16) + "px";
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
        this.container.hidden = false;
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


    /**
     * @description hide the palette
     */
    static hideAndRemove(): void {
        const menus = document.getElementsByClassName("CircularMenu");
        for (let i = 0; i < menus.length; i++) {
            menus[i].classList.remove("CircularMenuShow");
            menus[i].classList.add("CircularMenuHide");
            (<HTMLElement> menus[i]).hidden = true;
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