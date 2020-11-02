class ChalkCursor {



    /**
     * 
     * @param {*} color 
     * @returns the .style.cursor of the canvas if you want to have a cursor that looks like a chalk with the color color.
     */
    static getStyleCursor(color) {
        return {data: ChalkCursor.getCursorURL(color), x: 0 , y: 0};
    }


    static getCursorURL(color) {
        const sizeX = 32;
        const sizeY = 44;
        const chalkRadius = 3;
        const canvas = document.createElement('canvas');
        canvas.width = sizeX;
        canvas.height = sizeY;
        const context = canvas.getContext("2d");

        /*  ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(sizeX, sizeY);
          ctx.lineWidth = chalkRadius * 2;
          ctx.strokeStyle = color;
          ctx.stroke();
  
          ctx.beginPath();
          ctx.arc(chalkRadius, chalkRadius, chalkRadius, 0, 2 * Math.PI);
          ctx.strokeStyle = "black";
          ctx.lineWidth = 1;
          ctx.stroke();*/

        const angle = Math.atan2(sizeY, sizeX);
        const angleOpening = 0.3;
        const anglePlus = angle + angleOpening;
        const angleMinus = angle - angleOpening;
        const sizeHead = 16;
        const length = 34;
        const p1 = { x: sizeHead * Math.cos(anglePlus), y: sizeHead * Math.sin(anglePlus) };
        const p2 = { x: sizeHead * Math.cos(angleMinus), y: sizeHead * Math.sin(angleMinus) };
        const ll = {x : length * Math.cos(angle), y: length * Math.sin(angle) };

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