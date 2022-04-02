import { ActionEllipse } from './ActionEllipse';
import { ToolAbstractShape } from './ToolAbstractShape';

export abstract class ToolEllipse extends ToolAbstractShape {
    

    cx: number;
    cy: number;
    rx: number;
    ry: number;

    abstract compute = undefined;


    getShape: () => SVGEllipseElement = () => {
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


    actionDrawShape: () => ActionEllipse = () => {
        return new ActionEllipse(this.user.userID, this.cx, this.cy, this.rx, this.ry, this.user.color);
    }


    /**
     * the contour for making a magnet of the shape of an ellipse
     */
    fillDelineation: () => void = () => {
        const precision = 200;

        for (let i = 0; i < precision; i++) {
            const angle = 2 * Math.PI * i / precision;
            this.lastDelineation.addPoint({ x: this.cx + this.rx * Math.cos(angle), y: this.cy + this.ry * Math.sin(angle) });
        }
    }


}