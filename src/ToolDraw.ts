import { OptionManager } from './OptionManager';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { ActionFreeDraw } from './ActionFreeDraw';
import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Magnetizer } from './Magnetizer';
import { Drawing } from './Drawing';
import { Tool } from './Tool';
import { ToolDrawAudio } from './ToolDrawAudio';
import { MagnetHighlighter } from './MagnetHighlighter';
import { ToolDrawOptions } from './ToolDrawOptions';
import { ChalkParticules } from './ChalkParticules';

export class ToolDraw extends Tool {
    name = "ToolDraw";
    lastDelineation = new Magnetizer();
    private action: ActionFreeDraw;
    private guessMagnetConnection = new ToolDrawGuessMagnetConnection();
    private svgLines = [];




    constructor(user: User) {
        super(user);
        if (this.user.isCurrentUser) {
            document.getElementById("buttonEraser").hidden = false;
            document.getElementById("buttonChalk").hidden = true;
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }



    private pointIndex = 0;

    mousedown(evt): void {
        ToolDrawAudio.mousedown(evt.pressure);
        this.pointIndex = 0;
        this.svgLines = [];

        if (ToolDrawOptions.isParticules)
            ChalkParticules.start(this.x, this.y, evt.pressure, this.user.color);
        console.log(`new action from user ${this.user.userID}`);
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




    /* updateWhenDrawing(): void {
         const points = this.action.points;
         for (let i = this.pointIndex; i < points.length - 1; i++) {
             this.svgLines.push(ToolDraw.addSVGLine(points[i].x, points[i].y,
                 points[i + 1].x, points[i + 1].y, points[i].pressure, points[i].color));
         }
         this.pointIndex = this.action.points.length - 1;
 
     }*/


    mousemove(evt: PointerEvent): void {
        if (this.isDrawing) {
            const evtX = evt.offsetX;
            const evtY = evt.offsetY;
            const speed = Math.abs(evtX - this.x) + Math.abs(evtY - this.y);


            ToolDrawAudio.mousemove(speed);

            if (ToolDrawOptions.isParticules && Math.random() < 0.015 * speed)
                ChalkParticules.start(this.x, this.y, evt.pressure, this.user.color, 1);

            if (this.action.addPoint({ x: evtX, y: evtY, pressure: evt.pressure, color: this.user.color }))
                this.svgLines.push(ToolDraw.addSVGLine(this.x, this.y, evtX, evtY, evt.pressure, this.user.color));
            // 
            //  if (this.isSmoothing)
            //requestAnimationFrame(() => this.updateWhenDrawing());

            //this.svgLines.push(ToolDraw.addSVGLine(this.x, this.y, evtX, evtY, evt.pressure, this.user.color));
            /*else
                Drawing.drawLine(getCanvas().getContext("2d"), this.x, this.y, evtX, evtY, evt.pressure, this.user.color);*/

            MagnetHighlighter.unhighlightAll();
            if (evt.shiftKey) {
                this.guessMagnetConnection.live(this.action);
            }


        }
        else {
            MagnetHighlighter.unhighlightAll();
            if (evt.shiftKey) {
                this.updateMagnetPossibleConnection();
            }
        }


    }

    mouseup(evt): void {
        ToolDrawAudio.mouseup();
        if (this.isDrawing) {

            for (const l of this.svgLines)
                l.remove();
            this.svgLines = [];

            if (this.action.alreadyDrawnSth && ToolDrawOptions.isSmoothing)
                this.action.postTreatement();

            this.guessMagnetConnection.live(this.action);
            MagnetHighlighter.unhighlightAll();
            if (this.guessMagnetConnection.hasConnections && evt.shiftKey) {
                const [magnet1, magnet2] = this.guessMagnetConnection.pairMagnets;
                this.action.setInteractiveGraphInformation(magnet1.id, magnet2.id,
                    MagnetManager.getMagnetCenter(magnet1),
                    MagnetManager.getMagnetCenter(magnet2));

                BoardManager.addAction(this.action);
             
            }
            else {
                BoardManager.addAction(this.action);
            }
        }
    }


    updateMagnetPossibleConnection() {
        if (this.isDrawing) {
            this.guessMagnetConnection.live(this.action);
        }
        else {
            const magnetNear = MagnetManager.getMagnetNearPoint({ x: this.user.x, y: this.user.y });
            if (magnetNear)
                MagnetHighlighter.highlight(magnetNear);
        }

    }

    updateNoMagnetPossibleConnection() {
        MagnetHighlighter.unhighlightAll();
    }


    updateCursor(): void {
        if (this.user.isCurrentUser) {
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }

}



/**
 * this class enables to memorize to which magnets the last draw was connected to. It therefore remember the context (useful for drawing arrow ;) )
 */
class ToolDrawGuessMagnetConnection {

    private _magnet1: HTMLElement = undefined;
    private _magnet2: HTMLElement = undefined;

    get magnet1() { return this._magnet1; }
    get magnet2() { return this._magnet2; }


    get hasConnections() {
        return this._magnet1 || this._magnet2;
    }

    get pairMagnets() {
        const m1 = this._magnet1 ? this._magnet1 : this._magnet2;
        const m2 = this._magnet2 ? this._magnet2 : this._magnet1;
        return [m1, m2];
    }


    live(action: ActionFreeDraw) {
        const compute = () => {

            const foundMagnet1 = MagnetManager.getMagnetNearPoint(action.points[0]);
            const foundMagnet2 = MagnetManager.getMagnetNearPoint(action.points[action.points.length - 1]);

            /** for instance, the user draws an arrow */
            const almostLine = action.isAlmostLine();


            if (almostLine != undefined) {
                if (foundMagnet1 == this._magnet1 && foundMagnet2 == undefined)
                    return;
                if (foundMagnet2 == this._magnet1 && foundMagnet1 == undefined)
                    return;
                if (foundMagnet1 == this._magnet2 && foundMagnet2 == undefined)
                    return;
                if (foundMagnet2 == this._magnet2 && foundMagnet1 == undefined)
                    return;
            }

            this._magnet1 = foundMagnet1;
            this._magnet2 = foundMagnet2;
        }

        compute();
        MagnetHighlighter.unhighlightAll();

        if (this._magnet1)
            MagnetHighlighter.highlight(this._magnet1);
        if (this._magnet2)
            MagnetHighlighter.highlight(this._magnet2);

    }
}









