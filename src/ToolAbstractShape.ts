import { Action } from './Action';
import { User } from './User';
import { BoardManager } from './boardManager';
import { Magnetizer } from './Magnetizer';
import { Tool } from './Tool';

export abstract class ToolAbstractShape extends Tool {

    lastDelineation = new Magnetizer();
    shape: SVGElement = undefined;

    //to be implemented for a concrete shape
    abstract compute: (evt) => void;

    //to be implemented for a concrete shape
    abstract getShape: (evt) => SVGElement;

    //to be implemented for a concrete shape
    abstract actionDrawShape: (evt) => Action;


    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            document.getElementById("canvas").style.cursor = "crosshair";
        }
    }


    mousedown(evt: PointerEvent): void {
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
            const action = this.actionDrawShape(evt);
            action.redo();
            BoardManager.addAction(action);
            this.shape.remove();
        }

    }



    updateCursor(): void {
        if (this.user.isCurrentUser) {
            //at some point reflect the color in the cursor for drawing shapes ;)
        }
    }

}