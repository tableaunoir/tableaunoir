import { Sound } from './Sound';
import { Geometry } from './Geometry';
import { ActionErase } from './ActionErase';
import { User } from './User';
import { BoardManager } from './boardManager';
import { EraserCursor } from './EraserCursor';
import { Drawing } from './Drawing';
import { Tool } from './Tool';

/**
 * eraser tool
 * 
 * actually, it contains different modes for different sizes. The first mode is 0 and is the smallest size.
 * The current mode is iMode.
 * When the eraser is calm, it tends to stay in the current mode.
 * But, when the eraser is shaked, at some point, it goes in mode iMode + 1, and the size increases!
 * 
 */
export class ToolEraser extends Tool {


    private action: ActionErase; //the current action being constructed

    private temperature = 0;// if too high, the eraser will increase its size
    private iMode = 0; //the current mode index

    /** size of the erasers */
    private readonly modeSizes = [4, 8, 16, 32, 64];

    /**current eraser size (it is a field because it is needed in eraseSVG) */
    private eraseLineWidth = this.modeSizes[0];

    /** when the temperature passes this theeshold, go in the next mode */
    static readonly temperatureThreshold = 128;

    private timestamp = null;
    private oldSpeed = 0;


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
        document.getElementById("eraserGauge").setAttribute('style', "width : " + this.temperature + ";");
        document.getElementById("eraserGauge").style.backgroundColor = EraserCursor.temperatureToColor(this.temperature);
        document.getElementById("eraserLvl").innerHTML = (this.iMode < 4) ? "size " + this.iMode : "size max!";
    }


    mousedown(): void {
        this.iMode = 0;
        this.oldSpeed = 0;
        this.eraseLineWidth = this.modeSizes[this.iMode];
        this.action = new ActionErase(this.user.userID);
        this.action.addPoint({ x: this.x, y: this.y, lineWidth: this.eraseLineWidth });
        this.action.addPoint({ x: this.x, y: this.y, lineWidth: this.eraseLineWidth });//double
        Drawing.clearLine(this.x, this.y, this.x, this.y, this.eraseLineWidth);
    }


    mousemove(evt: PointerEvent): void {
        if (this.timestamp == null)
            this.timestamp = Date.now()

        const evtX = evt.offsetX;
        const evtY = evt.offsetY;

        if (this.isDrawing) {

            //calculating the time difference between the 2 last points
            const timeDiff = Date.now() - this.timestamp;

            //updating the timestamp
            this.timestamp = Date.now();

            const dist = Math.sqrt((this.x - evtX) ** 2 + (this.y - evtY) ** 2);
            const speed = dist / timeDiff;


            let acc = (speed - this.oldSpeed) / timeDiff;
            this.oldSpeed = speed;

            //the closer the cursor is to its max size the less the user needs to accelerat to reach it
            /*         const acc_threshold = 0.01;
                     if (acc < acc_threshold)
                     {
                         acc = 0;
                     }*/
            const tempIncr = speed * acc * 1000;

            SoundToolEraser.mousemove(Math.abs(this.x - evtX) + Math.abs(this.y - evtY));

            //not moving or last mode => decrease the temperature		
            if ((Math.abs(this.x - evtX) < 1 &&
                Math.abs(this.y - evtY) < 1) || (this.iMode >= this.modeSizes.length - 1)) 
                this.temperature = Math.max(0, this.temperature-1);

            else { //if moving and not last mode
                // this.temperature += Math.sqrt((this.x - evtX) ** 2 + (this.y - evtY) ** 2);
                this.temperature += tempIncr;
            }


            //temperature is above the threshold, changing cursor size indicator (iMode) and reseting temperature
            if (this.temperature > ToolEraser.temperatureThreshold) {
                this.iMode = Math.min(this.modeSizes.length - 1, this.iMode + 1);
                this.temperature = 0;
            }

            //using cursor size indicator (iMode) to calculate the cursor size
            this.eraseLineWidth = Math.max(2, this.modeSizes[this.iMode] + 5 * 2 * (evt.pressure - 0.5));

            //only call if the current user is the one currently drawing
            if (this.user.isCurrentUser)
                this.updateEraserCursor();

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



/**
 * this class implements the sound played when the user is erasing
 */
class SoundToolEraser {
    static audioEraser = new Audio("sounds/eraser.ogg");

    /**
     * @param distance
     * when mousemove, play some sound, depending on the distance between the previous point and the current point */
    static mousemove(distance: number) {
        if (!Sound.is) return;
        SoundToolEraser.audioEraser.volume = Math.min(1.0, distance / 20);
        if (SoundToolEraser.audioEraser.paused) {
            (<any>SoundToolEraser.audioEraser).mozPreservesPitch = false;
            (<any>SoundToolEraser.audioEraser).webkitPreservesPitch = false;
            SoundToolEraser.audioEraser.playbackRate = 0.8 + 0.5 * Math.random();
            SoundToolEraser.audioEraser.play();
        }
    }

    /**
     * when mouseup, stop the sound
     */
    static mouseup() {
        SoundToolEraser.audioEraser.pause();
    }
}