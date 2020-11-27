import { User } from './User';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Tool } from './Tool';

export abstract class ToolAbstractShape extends Tool {

    lastDelineation = new Delineation();
    shape: SVGRectElement = undefined;

    //to be implemented for a concrete shape
    abstract compute = undefined; 

    //to be implemented for a concrete shape
    abstract getShape = undefined; 

    //to be implemented for a concrete shape
    abstract drawShape = undefined;

    //to be implemented for a concrete shape
    abstract fillDelineation = undefined;


    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            document.getElementById("canvas").style.cursor = "crosshair";
        }
    }


    mousedown(evt: any): void {
        this.lastDelineation.reset();
        this.compute(evt);
        this.shape = this.getShape(evt);
        document.getElementById("svg").appendChild(this.shape);
    }

    mousemove(evt: any): void {
        if (this.isDrawing) {
            this.shape.remove();
            this.compute(evt);
            this.shape = this.getShape(evt);
            document.getElementById("svg").appendChild(this.shape);
        }

    }
    mouseup(evt: any): void {
        if (this.isDrawing) {
            this.fillDelineation(evt);
            this.lastDelineation.finish();
            this.drawShape(evt);
            this.shape.remove();
            BoardManager.save(this.lastDelineation._getRectangle());
        }

    }



    updateCursor(): void {
        if (this.user.isCurrentUser) {
            //at some point reflect the color in the cursor for drawing shapes ;)
        }
    }

}