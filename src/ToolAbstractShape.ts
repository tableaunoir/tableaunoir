import { Action } from './Action';
import { User } from './User';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Tool } from './Tool';

export abstract class ToolAbstractShape extends Tool {

    lastDelineation = new Delineation();
    shape: SVGElement = undefined;

    //to be implemented for a concrete shape
    abstract compute: (evt) => void;

    //to be implemented for a concrete shape
    abstract getShape: (evt) => SVGElement;

    //to be implemented for a concrete shape
    abstract actionDrawShape: (evt) => Action;

    //to be implemented for a concrete shape
    abstract fillDelineation: (evt) => void;


    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            document.getElementById("canvas").style.cursor = "crosshair";
        }
    }


    mousedown(evt: PointerEvent): void {
        this.lastDelineation.reset();
        this.compute(evt);
        this.shape = this.getShape(evt);
        document.getElementById("svg").appendChild(this.shape);
    }

    mousemove(evt: PointerEvent): void {
        if (this.isDrawing) {
            this.shape.remove();
            this.compute(evt);
            this.shape = this.getShape(evt);
            document.getElementById("svg").appendChild(this.shape);
        }

    }
    mouseup(evt: PointerEvent): void {
        if (this.isDrawing) {
            this.fillDelineation(evt);
            this.lastDelineation.finish();
            const action = this.actionDrawShape(evt);
            action.redo();
            BoardManager.addAction(action);
            this.shape.remove();
            //BoardManager.save(this.lastDelineation._getRectangle());
        }

    }



    updateCursor(): void {
        if (this.user.isCurrentUser) {
            //at some point reflect the color in the cursor for drawing shapes ;)
        }
    }

}