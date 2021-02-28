import { Sound } from './Sound';
import { Geometry } from './Geometry';
import { ActionErase } from './ActionErase';
import { User } from './User';
import { BoardManager } from './boardManager';
import { EraserCursor } from './EraserCursor';
import { Drawing } from './Drawing';
import { Tool } from './Tool';


export class ToolEraser extends Tool {

    private temperature = 0;
    private action: ActionErase;
    private iMode = 0;
    private readonly modeSizes = [4, 8, 16, 32, 64];
    private readonly modeTheshold = [1, 2, 2, 2, 100000];
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
    updateEraserCursor(): void {
        this.setToolCursorImage(EraserCursor.getStyleCursor(this.eraseLineWidth, this.temperature));
    }


    mousedown(): void {
        this.iMode = 0;
        this.eraseLineWidth = this.modeSizes[this.iMode];
        this.action = new ActionErase(this.user.userID);
        this.action.addPoint({ x: this.x, y: this.y, lineWidth: this.eraseLineWidth });
        this.action.addPoint({ x: this.x, y: this.y, lineWidth: this.eraseLineWidth });//double
        Drawing.clearLine(this.x, this.y, this.x, this.y, this.eraseLineWidth);
    }


    mousemove(evt: PointerEvent): void {
        const evtX = evt.offsetX;
        const evtY = evt.offsetY;

        const THESHOLD = this.modeTheshold[this.iMode];
        //this.eraseLineWidth = 10;
        if (this.isDrawing) {

            SoundToolEraser.mousemove(Math.abs(this.x - evtX) + Math.abs(this.y - evtY));

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

            this.action.addPoint({ x: evtX, y: evtY, lineWidth: this.eraseLineWidth });
            Drawing.clearLine(this.x, this.y, evtX, evtY, this.eraseLineWidth);

            this.eraseSVG(this.x, this.y);
        }
    }

    eraseSVG(x: number, y: number): void {
        const lines = document.getElementsByTagName("line");

        for (let i = 0; i < lines.length; i++) {
            const svgLine = <SVGLineElement>lines[i];
            const p1 = { x: parseInt(svgLine.getAttributeNS(null, 'x1')), y: parseInt(svgLine.getAttributeNS(null, 'y1')) };
            const p2 = { x: parseInt(svgLine.getAttributeNS(null, 'x2')), y: parseInt(svgLine.getAttributeNS(null, 'y2')) };

            const m = Geometry.middle(p1, p2);
            if (Geometry.distance({ x: x, y: y }, m) < this.eraseLineWidth)
                svgLine.remove();
        }


    }

    mouseup(): void {
        if (this.isDrawing) {
            SoundToolEraser.mouseup();
            this.iMode = 0;
            this.eraseLineWidth = this.modeSizes[0];
            this.temperature = 0;
    
            if (this.user.isCurrentUser)
                this.updateEraserCursor();
    
            BoardManager.addAction(this.action);
        }
    }

}




class SoundToolEraser {
    static audioEraser = new Audio("sounds/eraser.ogg");
    static mousemove(d: number) {
        if (!Sound.is) return;
        SoundToolEraser.audioEraser.volume = Math.min(1.0, d / 20);
        if (SoundToolEraser.audioEraser.paused) {
            (<any>SoundToolEraser.audioEraser).mozPreservesPitch = false;
            (<any>SoundToolEraser.audioEraser).webkitPreservesPitch = false;
            SoundToolEraser.audioEraser.playbackRate = 0.8 + 0.5 * Math.random();
            SoundToolEraser.audioEraser.play();
        }
    }

    static mouseup() {
        SoundToolEraser.audioEraser.pause();
    }
}