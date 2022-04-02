import { ToolEllipse } from './ToolEllipse';

export class ToolEllipseByCenter extends ToolEllipse {
    name = "ToolEllipseByCenter";


    compute: (evt) => void = (evt) => {

        this.cx = this.xInit;
        this.cy = this.yInit;
        this.rx = Math.abs(this.x - this.xInit);
        this.ry = Math.abs(this.y - this.yInit);

        if (evt.shiftKey) {
            this.rx = Math.min(this.rx, this.ry);
            this.ry = Math.min(this.rx, this.ry);
        }

    }



}