import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Tool } from './Tool';
import { ToolAbstractShape } from './ToolAbstractShape';

export class ToolEllipse extends ToolAbstractShape {

    cx;
    cy;
    rx;
    ry;

    compute = (evt) => {
        const x1 = Math.min(this.xInit, this.x);
        const y1 = Math.min(this.yInit, this.y);
        const x2 = Math.max(this.xInit, this.x);
        const y2 = Math.max(this.yInit, this.y);

        this.cx = (x1 + x2) / 2;
        this.cy = (y1 + y2) / 2;
        this.rx = (x2 - x1) / 2;
        this.ry = (y2 - y1) / 2;

        if(evt.shiftKey) {
            this.rx = Math.min(this.rx, this.ry);
            this.ry = Math.min(this.rx, this.ry);
        }

    }
    getShape = (evt) => {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGEllipseElement>document.createElementNS(svgns, 'ellipse');


        shape.setAttributeNS(null, 'cx', "" + this.cx);
        shape.setAttributeNS(null, 'cy', "" + this.cy);
        shape.setAttributeNS(null, 'rx', "" + this.rx);
        shape.setAttributeNS(null, 'ry', "" + this.ry);
        shape.setAttributeNS(null, 'fill-opacity', "0.1");
        shape.setAttributeNS(null, 'stroke', this.user.color);
        shape.setAttributeNS(null, 'fill', "#FFFFFFFF");
        return shape;
    }


    drawShape = (evt) => {
        Drawing.drawEllipse({ cx: this.cx, cy: this.cy, rx: this.rx, ry: this.ry }, this.user.color);
    }



    fillDelineation = (evt) => {
        const x1 = Math.min(this.xInit, this.x);
        const y1 = Math.min(this.yInit, this.y);
        const x2 = Math.max(this.xInit, this.x);
        const y2 = Math.max(this.yInit, this.y);

        this.lastDelineation.addPoint({ x: x1, y: y1 });
        this.lastDelineation.addPoint({ x: x2, y: y1 });
        this.lastDelineation.addPoint({ x: x2, y: y2 });
        this.lastDelineation.addPoint({ x: x1, y: y2 });
        this.lastDelineation.addPoint({ x: x1, y: y1 });
    }


}