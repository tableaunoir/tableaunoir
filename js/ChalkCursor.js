class ChalkCursor {

    /**
     * 
     * @param {*} color 
     * @returns the .style.cursor of the canvas if you want to have a cursor that looks like a chalk with the color color.
     */
    static getStyleCursor(color) {
        return `url(${ChalkCursor.getCursorURL(color)}) 0 0, auto`;
    }


    static getCursorURL(color) {
        const sizeX = 32;
        const sizeY = 44;
        const chalkRadius = 3;
        const canvas = document.createElement('canvas');
        canvas.width = sizeX;
        canvas.height = sizeY;
        const ctx = canvas.getContext("2d");
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(sizeX, sizeY);
        ctx.lineWidth = chalkRadius * 2;
        ctx.strokeStyle = color;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(chalkRadius, chalkRadius, chalkRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();
        return canvas.toDataURL();
    }
}