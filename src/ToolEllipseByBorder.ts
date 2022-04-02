import { ToolEllipse } from './ToolEllipse';

export class ToolEllipseByBorder extends ToolEllipse {
    name = "ToolEllipseByBorder";
    compute: (evt:PointerEvent) => void = (evt:PointerEvent) => {
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
    


}