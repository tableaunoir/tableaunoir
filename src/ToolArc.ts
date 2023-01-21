import { Layout } from './Layout';
import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Tool } from './Tool';
import { Share } from './share';
import { ActionFreeDraw } from './ActionFreeDraw';

export class ToolArc extends Tool {
    name = "ToolArc";
    private elementCenter: HTMLElement;
    private elementRadius: HTMLElement;
    private elementCircle: SVGEllipseElement;
    isDrawing = false;
    private action: ActionFreeDraw;

    private center: { x: number, y: number };
    private radiusHandlePosition: { x: number, y: number };


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

        this.elementCenter.style.left = (Layout.getWindowLeft() + 300) + "px";
        this.elementCenter.style.top = "300px";
        this.elementRadius.style.left = (Layout.getWindowLeft() + 400) + "px";
        this.elementRadius.style.top = "400px";

        document.getElementById("board").appendChild(this.elementCenter);
        document.getElementById("board").appendChild(this.elementRadius);
        document.getElementById("svg").appendChild(this.elementCircle);

        if (this.user.isCurrentUser) {
            this.makeDraggable(this.elementCenter, () => this.updateWhenDragged());
            this.makeDraggable(this.elementRadius, () => this.updateWhenDragged());
        }

        this.computeCenter();
        this.computeRadiusHandlePosition();

        if (this.user.isCurrentUser)
            setTimeout(this.updateWhenDragged, 1);
    }


    /**
     * update the tool element when some elements are dragged
     */
    private updateWhenDragged() {
        this.computeCenter();
        this.computeRadiusHandlePosition();
        Share.execute("toolArcSetAttributes", [this.user.userID, this.center, this.radiusHandlePosition]); // call this.update
    }

    /**
     * draw the circle guideline element correctly
     */
    update(): void {
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


    /**
     * 
     * @param center 
     * @param radiusHandlePosition 
     * @description set the two attributes from the outside (share mode)
     */
    setAttributes(center: { x: number, y: number }, radiusHandlePosition: { x: number, y: number }): void {
        this.center = center;
        this.radiusHandlePosition = radiusHandlePosition;
        this.elementRadius.style.left = (radiusHandlePosition.x - this.elementRadius.offsetWidth / 2) + "px";
        this.elementRadius.style.top = (radiusHandlePosition.y - this.elementRadius.offsetHeight / 2) + "px";
        this.elementCenter.style.left = (center.x - this.elementCenter.offsetWidth / 2) + "px";
        this.elementCenter.style.top = (center.y - this.elementCenter.offsetHeight / 2) + "px";
        this.update();
    }


    private computeCenter(): void {
        this.center = {
            x: this.elementCenter.offsetLeft + this.elementCenter.offsetWidth / 2,
            y: this.elementCenter.offsetTop + this.elementCenter.offsetHeight / 2
        };
    }


    private computeRadiusHandlePosition(): void {
        this.radiusHandlePosition = {
            x: this.elementRadius.offsetLeft + this.elementRadius.offsetWidth / 2,
            y: this.elementRadius.offsetTop + this.elementRadius.offsetHeight / 2
        };
    }

    get radius(): number {
        const C = this.center;
        const D = this.radiusHandlePosition;
        return Math.sqrt((C.x - D.x) ** 2 + (C.y - D.y) ** 2);
    }


    get radiusHandleAngle(): number {
        const C = this.center;
        const D = this.radiusHandlePosition;
        return Math.atan2(D.y - C.y, D.x - C.x);
    }




    destructor(): void {
        this.elementCenter.remove();
        this.elementRadius.remove();
        this.elementCircle.remove();
    }


    private makeDraggable(element: HTMLElement, callback: () => void): void {
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


        const elementDrag = (e: PointerEvent) => {
            if (!drag) return;

            const canvas = getCanvas();

            canvas.style.cursor = "none";
            e.preventDefault();
            // calculate the new cursor position:
            const dx = x - e.clientX * Layout.getZoom();
            const dy = y - e.clientY * Layout.getZoom();
            x = e.clientX * Layout.getZoom();
            y = e.clientY * Layout.getZoom();

            element.style.left = "" + (element.offsetLeft - dx) + "px";
            element.style.top = "" + (element.offsetTop - dy) + "px";

            //from the center, we drag all the compass
            if (element == this.elementCenter) {
                this.elementRadius.style.left = "" + (this.elementRadius.offsetLeft - dx) + "px";
                this.elementRadius.style.top = "" + (this.elementRadius.offsetTop - dy) + "px";
            }
            callback();
        }


        const closeDragElement = () => {
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



    mousedown(): void {
        this.action = new ActionFreeDraw(this.user.userID);
        this.isDrawing = true;
        this.elementRadius.style.visibility = "hidden";
        const A = this.correctPointOnCircle({ x: this.x, y: this.y });
        this.action.addPoint({ x: A.x, y: A.y, pressure: 0, color: this.user.color });
    }

    mousemove(evt: PointerEvent): void {
        if (this.isDrawing) {
            const evtX = evt.offsetX;
            const evtY = evt.offsetY;
            const A = this.correctPointOnCircle({ x: this.x, y: this.y });
            const B = this.correctPointOnCircle({ x: evtX, y: evtY });
            this.action.addPoint({ x: B.x, y: B.y, pressure: evt.pressure, color: this.user.color });
            Drawing.drawLine(getCanvas().getContext("2d"), A.x, A.y, B.x, B.y, evt.pressure, this.user.color);
        }

    }

    mouseup(): void {
        if (!this.action) return; //ugly fix
        this.isDrawing = false;
        this.elementRadius.style.visibility = "visible";
        BoardManager.addAction(this.action);
        this.action = undefined;
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