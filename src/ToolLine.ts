import { ActionLine } from './ActionLine';
import { ToolAbstractShape } from './ToolAbstractShape';

export class ToolLine extends ToolAbstractShape {
    name = "ToolLine";

    x1: number;
    y1: number;
    x2: number;
    y2: number;

    compute: (evt) => void = (evt) => {
        this.x1 = this.xInit;
        this.y1 = this.yInit;
        this.x2 = this.x;
        this.y2 = this.y;

        if (evt.shiftKey) {
            if (Math.abs(this.x1 - this.x2) > Math.abs(this.y1 - this.y2))
                this.y2 = this.y1;
            else
                this.x2 = this.x1;
        }
    }

    getShape: () => SVGLineElement = () => {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGLineElement>document.createElementNS(svgns, 'line');

        shape.setAttributeNS(null, 'x1', "" + this.x1);
        shape.setAttributeNS(null, 'y1', "" + this.y1);
        shape.setAttributeNS(null, 'x2', "" + (this.x2));
        shape.setAttributeNS(null, 'y2', "" + (this.y2));
        shape.setAttributeNS(null, 'stroke', this.user.color);
        return shape;
    }


    actionDrawShape: () => ActionLine = () => {
        return new ActionLine(this.user.userID, this.x1, this.y1, this.x2, this.y2, this.user.color);
    }





}