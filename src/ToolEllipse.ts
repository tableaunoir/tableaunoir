import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Tool } from './Tool';
import { ToolAbstractShape } from './ToolAbstractShape';

export abstract class ToolEllipse extends ToolAbstractShape {

    cx;
    cy;
    rx;
    ry;

    abstract compute = undefined;


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


    /**
     * the contour for making a magnet of the shape of an ellipse
     */
    fillDelineation = (evt) => {
        const precision = 200;

        for (let i = 0; i < precision; i++) {
            const angle = 2 * Math.PI * i / precision;
            this.lastDelineation.addPoint({ x: this.cx + this.rx * Math.cos(angle), y: this.cy + this.ry * Math.sin(angle) });
        }
    }


}