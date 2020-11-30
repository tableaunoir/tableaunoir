import { Layout } from './Layout';
import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Tool } from './Tool';

export class ToolArc extends Tool {

    lastDelineation = new Delineation();
    private alreadyDrawnSth = false;
    elementCenter: HTMLElement;
    elementRadius: HTMLElement;
    elementCircle: SVGEllipseElement;
    isDrawing: boolean = false;


    constructor(user: User) {
        super(user);
        this.elementCenter = document.createElement("div");
        this.elementRadius = document.createElement("div");
        this.elementCenter.classList.add("handle");
        this.elementRadius.classList.add("handle");

        this.elementCenter.classList.add("handleCenter");
        this.elementRadius.classList.add("handleRadius");

        const svgns = "http://www.w3.org/2000/svg";
        this.elementCircle = <SVGEllipseElement>document.createElementNS(svgns, 'ellipse');

        this.elementCenter.style.left = "300px";
        this.elementCenter.style.top = "300px";
        this.elementRadius.style.left = "400px";
        this.elementRadius.style.top = "400px";

        document.getElementById("board").appendChild(this.elementCenter);
        document.getElementById("board").appendChild(this.elementRadius);
        document.getElementById("svg").appendChild(this.elementCircle);

        this.makeDraggable(this.elementCenter, () => this.update());
        this.makeDraggable(this.elementRadius, () => this.update());

        this.update();
    }


    get center(): { x: number, y: number } {
        return {
            x: this.elementCenter.offsetLeft + this.elementCenter.offsetWidth / 2,
            y: this.elementCenter.offsetTop + this.elementCenter.offsetHeight / 2
        };
    }


    get radiusHandlePosition(): { x: number, y: number } {
        return {
            x: this.elementRadius.offsetLeft + this.elementRadius.offsetWidth / 2,
            y: this.elementRadius.offsetTop + this.elementRadius.offsetHeight / 2
        };
    }

    get radius(): number {
        const C = this.center;
        const D = this.radiusHandlePosition;
        return Math.sqrt((C.x - D.x) ** 2 + (C.y - D.y) ** 2);
    }


    get radiusHandleAngle() : number {
        const C = this.center;
        const D = this.radiusHandlePosition;
        return Math.atan2(D.y - C.y, D.x - C.x);
    }

    update() {
        const C = this.center;
        const r = this.radius;
        this.elementCircle.setAttributeNS(null, 'cx', "" + C.x);
        this.elementCircle.setAttributeNS(null, 'cy', "" + C.y);
        this.elementCircle.setAttributeNS(null, 'rx', "" + r);
        this.elementCircle.setAttributeNS(null, 'ry', "" + r);
        this.elementCircle.setAttributeNS(null, 'stroke-opacity', "0.5");
        this.elementCircle.setAttributeNS(null, 'fill-opacity', "0.005");
        this.elementCircle.setAttributeNS(null, 'stroke', this.user.color);

        this.elementRadius.style.rotate = `${this.radiusHandleAngle}rad`;
    }

    destructor() {
        this.elementCenter.remove();
        this.elementRadius.remove();
        this.elementCircle.remove();
    }


    private makeDraggable(element, callback) {
        let drag = false;
        let x = 0;
        let y = 0;
        element.onmousedown = (evt) => {
            drag = true;

            x = evt.clientX * Layout.getZoom();
            y = evt.clientY * Layout.getZoom();

            document.onpointermove = elementDrag;
            document.onmouseup = closeDragElement;
            document.onpointerup = closeDragElement;

        };


        let elementDrag = (e) => {
            if (!drag) return;

            const canvas = getCanvas();

            canvas.style.cursor = "none";
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            const dx = x - e.clientX * Layout.getZoom();
            const dy = y - e.clientY * Layout.getZoom();
            x = e.clientX * Layout.getZoom();
            y = e.clientY * Layout.getZoom();

            element.style.left = element.offsetLeft - dx;
            element.style.top = element.offsetTop - dy;

            //from the center, we drag all the compass
            if (element == this.elementCenter) {
                this.elementRadius.style.left = "" + (this.elementRadius.offsetLeft - dx);
                this.elementRadius.style.top = "" + (this.elementRadius.offsetTop - dy);
            }
            callback();
        }


        let closeDragElement = () => {
            if (!drag)
                return;

            drag = false;

            const canvas = getCanvas();
            canvas.style.cursor = "crosshair";

            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }



    mousedown(evt: any): void {
        this.isDrawing = true;
        BoardManager.saveCurrentScreen();
        this.elementRadius.style.visibility = "hidden";
    }

    mousemove(evt: any): void {
        if (this.isDrawing) {
            const evtX = evt.offsetX;
            const evtY = evt.offsetY;
            const A = this.correctPointOnCircle({ x: this.x, y: this.y });
            const B = this.correctPointOnCircle({ x: evtX, y: evtY });
            Drawing.drawLine(getCanvas().getContext("2d"), A.x, A.y, B.x, B.y, evt.pressure, this.user.color);
        }

    }
    mouseup(evt: any): void {
        this.isDrawing = false;
        this.elementRadius.style.visibility = "visible";
    }



    correctPointOnCircle(A: { x: number, y: number }): { x: number, y: number } {
        const C = this.center;
        const angle = Math.atan2(A.y - C.y, A.x - C.x);
        const r = this.radius;
        return { x: C.x + r * Math.cos(angle), y: C.y + r * Math.sin(angle) };
    }

    updateCursor(): void {
        if (this.user.isCurrentUser) {
            this.setToolCursorImage(ChalkCursor.getStyleCursor(this.user.color));
        }
    }

}