import { ActionRectangle } from './ActionRectangle';
import { ToolAbstractShape } from './ToolAbstractShape';

export class ToolRectangle extends ToolAbstractShape {
    name = "ToolRectangle";
    x1: number;
    y1: number;
    x2: number;
    y2: number;

    compute: (evt) => void = (evt) => {
        this.x1 = Math.min(this.xInit, this.x);
        this.y1 = Math.min(this.yInit, this.y);
        this.x2 = Math.max(this.xInit, this.x);
        this.y2 = Math.max(this.yInit, this.y);

        const w = this.x2 - this.x1;
        const h = this.y2 - this.y1;
        if (evt.shiftKey) {
            const minwh = Math.min(w, h);
            this.x2 = this.x1 + minwh;
            this.y2 = this.y1 + minwh;
        }
    }

    getShape: () => SVGRectElement = () => {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGRectElement>document.createElementNS(svgns, 'rect');


        shape.setAttributeNS(null, 'x', "" + this.x1);
        shape.setAttributeNS(null, 'y', "" + this.y1);
        shape.setAttributeNS(null, 'width', "" + (this.x2 - this.x1));
        shape.setAttributeNS(null, 'height', "" + (this.y2 - this.y1));
        shape.setAttributeNS(null, 'fill-opacity', "0.1");
        shape.setAttributeNS(null, 'stroke', this.user.color);
        shape.setAttributeNS(null, 'fill', "#FFFFFFFF");
        return shape;
    }


    actionDrawShape: () => ActionRectangle = () => {
        return new ActionRectangle(this.user.userID, this.x1, this.y1, this.x2, this.y2, this.user.color);
    }






}