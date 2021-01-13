import { Sound } from './Sound';
import { OptionManager } from './OptionManager';
import { ConstraintDrawing } from './ConstraintDrawing';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { ActionFreeDraw } from './ActionFreeDraw';
import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { Tool } from './Tool';


export class ToolDraw extends Tool {
    lastDelineation = new Delineation();
    private action: ActionFreeDraw;
    private svgLines = [];

    private isSmoothing = false;



    constructor(user: User) {
        super(user);
        OptionManager.boolean({
            name: "smoothing",
            defaultValue: true,
            onChange: (s) => {
                this.isSmoothing = s;
            }
        });
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }


    mousedown(evt): void {
        ToolDrawAudio.mousedown(evt.pressure);
        this.lastDelineation.reset();
        this.lastDelineation.addPoint({ x: this.x, y: this.y });
        this.svgLines = [];

        this.action = new ActionFreeDraw(this.user.userID);
        this.action.addPoint({ x: this.x, y: this.y, pressure: 0, color: this.user.color });
    }



    static addSVGLine(
        x1: number, y1: number, x2: number, y2: number,
        pressure = 1.0, color: string = UserManager.me.getCurrentColor()): SVGLineElement {

        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGLineElement>document.createElementNS(svgns, 'line');

        shape.setAttributeNS(null, 'x1', "" + x1);
        shape.setAttributeNS(null, 'y1', "" + y1);
        shape.setAttributeNS(null, 'x2', "" + (x2));
        shape.setAttributeNS(null, 'y2', "" + (y2));
        shape.setAttributeNS(null, 'stroke', color);
        shape.setAttributeNS(null, 'stroke-width', "" + (Drawing.lineWidth * (1 + 2 * pressure)));
        shape.setAttributeNS(null, 'opacity', "" + (0.9 + 0.1 * pressure));


        document.getElementById("svg").appendChild(shape);
        return shape;
    }



    mousemove(evt: PointerEvent): void {
        if (this.isDrawing) {
            const evtX = evt.offsetX;
            const evtY = evt.offsetY;

            ToolDrawAudio.mousemove(Math.abs(evtX - this.x) + Math.abs(evtY - this.y));

            if (this.lastDelineation.isDrawing()) {//this guard is because, when a magnet is created the user does not know the drawing stopped.

                this.action.addPoint({ x: evtX, y: evtY, pressure: evt.pressure, color: this.user.color });
                // 
                //  if (this.isSmoothing)
                this.svgLines.push(ToolDraw.addSVGLine(this.x, this.y, evtX, evtY, evt.pressure, this.user.color));
                /*else
                    Drawing.drawLine(getCanvas().getContext("2d"), this.x, this.y, evtX, evtY, evt.pressure, this.user.color);*/
            }


        }
    }

    mouseup(evt: MouseEvent): void {
        ToolDrawAudio.mouseup();
        if (this.isDrawing) {
            if (evt.ctrlKey)
                console.log("ctrl!");
            const magnet1 = evt.ctrlKey ? MagnetManager.getMagnetNearestFromPoint(this.action.points[0]) : MagnetManager.getMagnetNearPoint(this.action.points[0]);
            const magnet2 = evt.ctrlKey ? MagnetManager.getMagnetNearestFromPoint(this.action.points[this.action.points.length - 1]) :
                MagnetManager.getMagnetNearPoint(this.action.points[this.action.points.length - 1]);



            if (magnet1 && magnet2) {
                ConstraintDrawing.freeDraw(this.svgLines, magnet1.id, magnet2.id);
                this.svgLines = [];
            }
            else {
                for (const l of this.svgLines)
                    l.remove();
                this.svgLines = [];

                if (this.action.alreadyDrawnSth && this.isSmoothing)
                    this.action.smoothify();

                for (const p of this.action.points) {
                    this.lastDelineation.addPoint({ x: p.x, y: p.y });
                }
                this.lastDelineation.finish();

                this.action.redo();
                BoardManager.addAction(this.action);
            }
        }
    }






    updateCursor(): void {
        if (this.user.isCurrentUser) {
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }

}



class ToolDrawAudio {
    static audioChalkDown: HTMLAudioElement = new Audio("sounds/chalkdown.ogg");
    static audioChalkMove: HTMLAudioElement = new Audio("sounds/chalkmove.ogg");

    static mousedown(p: number) {
        if(!Sound.is) return;
        ToolDrawAudio.audioChalkDown.pause();
        ToolDrawAudio.audioChalkDown.currentTime = 0;
        ToolDrawAudio.audioChalkDown.volume = p/2;
        ToolDrawAudio.audioChalkDown.play();
        ToolDrawAudio.audioChalkMove.loop = true;
    }


    static mousemove(d: number) {
        if(!Sound.is) return;
        ToolDrawAudio.audioChalkMove.volume = Math.min(1.0, d / 20);
        if (ToolDrawAudio.audioChalkMove.paused) {
            ToolDrawAudio.audioChalkMove.play();
        }


    }


    static mouseup() {
        if(!Sound.is) return;
        ToolDrawAudio.audioChalkDown.pause();
        ToolDrawAudio.audioChalkMove.pause();
        ToolDrawAudio.audioChalkDown.currentTime = 0;
        ToolDrawAudio.audioChalkMove.currentTime = 0;
    }

}