class ChalkCursor {

    /** undefined for right-handed, "true" for left-handed */
    static leftHanded = localStorage.getItem("leftHanded");


    /**
     * @description adds clicks on buttons in the menu for left- and right-handed options
     */
    static init() {
        let change = (param) => {
            ChalkCursor.leftHanded = param;
            if (!param)
                localStorage.removeItem("leftHanded");
            else
                localStorage.setItem("leftHanded", "true");
            UserManager.me.updateCursor();
            Menu.hide();
        }

        buttonLefthanded.onclick = () => { change(true); }
        buttonRighthanded.onclick = () => { change(false); }
    }

    /**
     * 
     * @param {*} color 
     * @returns the .style.cursor of the canvas if you want to have a cursor that looks like a chalk with the color color.
     * The cursor is an objet {data: dataofimage, x: position where to click, y: position where to click}
     */
    static getStyleCursor(color) {
        return { data: ChalkCursor.getCursorURL(color), x: ChalkCursor.leftHanded ? 32 : 0, y: 0 };
    }


    /**
     * 
     * @param {*} color 
     * @returns the image information of the chalk of a specific color
     */
    static getCursorURL(color) {
        const sizeX = 32;
        const sizeY = 44;
        const angleOpening = 0.3;
        const sizeHead = 16;
        const length = 34;

        const canvas = document.createElement('canvas');
        canvas.width = sizeX;
        canvas.height = sizeY;
        const context = canvas.getContext("2d");

        if (ChalkCursor.leftHanded) //transformation of the chalk picture for left-handed
            context.transform(-1, 0, 0, 1, sizeX, 0);

        const angle = Math.atan2(sizeY, sizeX);

        const anglePlus = angle + angleOpening;
        const angleMinus = angle - angleOpening;

        const p1 = { x: sizeHead * Math.cos(anglePlus), y: sizeHead * Math.sin(anglePlus) };
        const p2 = { x: sizeHead * Math.cos(angleMinus), y: sizeHead * Math.sin(angleMinus) };
        const ll = { x: length * Math.cos(angle), y: length * Math.sin(angle) };

        context.beginPath();
        context.moveTo(0, 0);
        context.lineTo(p1.x, p1.y);
        context.lineTo(p1.x + ll.x, p1.y + ll.y);
        context.lineTo(p2.x + ll.x, p2.y + ll.y);
        context.lineTo(p2.x, p2.y);
        context.lineTo(0, 0);

        context.lineWidth = 1;
        context.strokeStyle = "black";
        context.stroke();
        context.fillStyle = color;
        context.fill();

        context.beginPath();
        context.moveTo(sizeHead * Math.cos(anglePlus), sizeHead * Math.sin(anglePlus));
        context.lineTo(sizeHead * Math.cos(angleMinus), sizeHead * Math.sin(angleMinus));
        context.stroke();

        return canvas.toDataURL();
    }
}