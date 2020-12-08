import { User } from './User';
import { BoardManager } from './boardManager';
import { EraserCursor } from './EraserCursor';
import { Drawing } from './Drawing';
import { Tool } from './Tool';


export class ToolEraser extends Tool {

    private temperature = 0;
    private iMode = 0;
    private readonly modeSizes = [4, 8, 16, 32, 64];
    private readonly modeTheshold = [4, 4, 4, 6, 100000];
    private eraseLineWidth = this.modeSizes[0];
    static readonly temperatureThreshold = 15;

    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = true;
            document.getElementById("buttonChalk").hidden = false;
            this.updateEraserCursor();

        }
    }
    updateEraserCursor() {
        this.setToolCursorImage(EraserCursor.getStyleCursor(this.eraseLineWidth, this.temperature));
    }


    mousedown(): void {
        this.iMode = 0;
        this.eraseLineWidth = this.modeSizes[this.iMode];
        Drawing.clearLine(this.x, this.y, this.x, this.y, this.eraseLineWidth);
    }


    mousemove(evt: PointerEvent): void {
        const evtX = evt.offsetX;
        const evtY = evt.offsetY;

        const THESHOLD = this.modeTheshold[this.iMode];
        //this.eraseLineWidth = 10;
        if (this.isDrawing) {

            if (Math.abs(this.x - evtX) < THESHOLD &&
                Math.abs(this.y - evtY) < THESHOLD)
                this.temperature = Math.max(this.temperature - 1, 0);

            if (Math.abs(this.x - evtX) > THESHOLD ||
                Math.abs(this.y - evtY) > THESHOLD)
                this.temperature++;

            if (this.temperature > ToolEraser.temperatureThreshold) {
                this.iMode = Math.min(this.modeSizes.length - 1, this.iMode + 1);
                this.temperature = -ToolEraser.temperatureThreshold;
            }

            this.eraseLineWidth = Math.max(2, this.modeSizes[this.iMode] + 5 * 2 * (evt.pressure - 0.5));


            if (this.user.isCurrentUser) {
                this.updateEraserCursor();
            }

            Drawing.clearLine(this.x, this.y, evtX, evtY, this.eraseLineWidth);

        }
    }

    mouseup(): void {
        this.iMode = 0;
        this.eraseLineWidth = this.modeSizes[0];
        this.temperature = 0;

        if (this.user.isCurrentUser)
            this.updateEraserCursor();

        BoardManager.saveCurrentScreen();
    }

}