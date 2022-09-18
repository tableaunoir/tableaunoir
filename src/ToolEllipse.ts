import { ActionEllipse } from './ActionEllipse';
import { ToolAbstractShape } from './ToolAbstractShape';

export abstract class ToolEllipse extends ToolAbstractShape {


    cx: number;
    cy: number;
    rx: number;
    ry: number;

    abstract compute;


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




}