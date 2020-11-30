import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Tool } from './Tool';

export class ToolDraw extends Tool {

    lastDelineation = new Delineation();
    private alreadyDrawnSth = false;


    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }


    mousedown(): void {
        this.lastDelineation.reset();
        this.lastDelineation.addPoint({ x: this.x, y: this.y });
    }

    mousemove(evt: PointerEvent): void {
        if (this.isDrawing) {
            const evtX = evt.offsetX;
            const evtY = evt.offsetY;

            if (this.lastDelineation.isDrawing()) {//this guard is because, when a magnet is created the user does not know the drawing stopped.
                Drawing.drawLine(getCanvas().getContext("2d"), this.x, this.y, evtX, evtY, evt.pressure, this.user.color);
                this.lastDelineation.addPoint({ x: evtX, y: evtY });
            }

            if (Math.abs(this.x - this.xInit) > 1 || Math.abs(this.y - this.yInit) > 1)
                this.alreadyDrawnSth = true;
        }

    }
    mouseup(): void {
        this.lastDelineation.finish();
        if (this.isDrawing && !this.alreadyDrawnSth) {
            Drawing.drawDot(this.x, this.y, this.user.color);
        }
        BoardManager.save(this.lastDelineation._getRectangle());
        this.alreadyDrawnSth = false;
    }

    

    updateCursor(): void {
        if (this.user.isCurrentUser) {
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }

}