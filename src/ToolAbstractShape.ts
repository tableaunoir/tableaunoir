import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Tool } from './Tool';

export abstract class ToolAbstractShape extends Tool {

    lastDelineation = new Delineation();
    shape: SVGRectElement = undefined;

    getShape = undefined;

    drawShape = undefined;

    fillDelineation = undefined;


    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }


    mousedown(evt: any): void {
        this.lastDelineation.reset();
        this.shape = this.getShape(evt);
        document.getElementById("svg").appendChild(this.shape);
    }

    mousemove(evt: any): void {
        if (this.isDrawing) {
            this.shape.remove();
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
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }

}