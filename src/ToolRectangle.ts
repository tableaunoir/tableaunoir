import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { ToolAbstractShape } from './ToolAbstractShape';

export class ToolRectangle extends ToolAbstractShape {


    getShape = (evt) => {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGRectElement>document.createElementNS(svgns, 'rect');
        const x1 = Math.min(this.xInit, this.x);
        const y1 = Math.min(this.yInit, this.y);
        const x2 = Math.max(this.xInit, this.x);
        const y2 = Math.max(this.yInit, this.y);

        shape.setAttributeNS(null, 'x', "" + x1);
        shape.setAttributeNS(null, 'y', "" + y1);
        shape.setAttributeNS(null, 'width', "" + (x2 - x1));
        shape.setAttributeNS(null, 'height', "" + (y2 - y1));
        shape.setAttributeNS(null, 'fill-opacity', "0.1");
        shape.setAttributeNS(null, 'stroke', this.user.color);
        shape.setAttributeNS(null, 'fill', "#FFFFFFFF");
        return shape;
    }


    drawShape = (evt) => {
        const x1 = Math.min(this.xInit, this.x);
        const y1 = Math.min(this.yInit, this.y);
        const x2 = Math.max(this.xInit, this.x);
        const y2 = Math.max(this.yInit, this.y);

        Drawing.drawRectangle({ x1: x1, y1: y1, x2: x2, y2: y2 }, this.user.color);
    }



    fillDelineation = (evt) => {
        const x1 = Math.min(this.xInit, this.x);
        const y1 = Math.min(this.yInit, this.y);
        const x2 = Math.max(this.xInit, this.x);
        const y2 = Math.max(this.yInit, this.y);

        this.lastDelineation.addPoint({x: x1, y: y1});
        this.lastDelineation.addPoint({x: x2, y: y1});
        this.lastDelineation.addPoint({x: x2, y: y2});
        this.lastDelineation.addPoint({x: x1, y: y2});
        this.lastDelineation.addPoint({x: x1, y: y1});
    }


}