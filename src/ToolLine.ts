import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { ToolAbstractShape } from './ToolAbstractShape';

export class ToolLine extends ToolAbstractShape {


    compute: () => void = () => {

    }

    getShape: () => SVGLineElement = () => {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGLineElement>document.createElementNS(svgns, 'line');

        shape.setAttributeNS(null, 'x1', "" + this.xInit);
        shape.setAttributeNS(null, 'y1', "" + this.yInit);
        shape.setAttributeNS(null, 'x2', "" + (this.x));
        shape.setAttributeNS(null, 'y2', "" + (this.y));
        shape.setAttributeNS(null, 'stroke', this.user.color);
        shape.setAttributeNS(null, 'fill', "#FFFFFFFF");
        return shape;
    }


    drawShape: () => void = () => {
        Drawing.drawLine(getCanvas().getContext("2d"), this.xInit, this.yInit, this.x, this.y, 1.0, this.user.color);
    }



    fillDelineation: () => void = () => {
        this.lastDelineation.addPoint({ x: this.xInit, y: this.yInit });
        this.lastDelineation.addPoint({ x: this.x, y: this.y });
    }


}