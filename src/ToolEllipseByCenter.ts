import { User } from './User';
import { ChalkCursor } from './ChalkCursor';
import { BoardManager } from './boardManager';
import { Delineation } from './Delineation';
import { Drawing } from './Drawing';
import { getCanvas } from './main';
import { Tool } from './Tool';
import { ToolAbstractShape } from './ToolAbstractShape';
import { ToolEllipse } from './ToolEllipse';

export class ToolEllipseByCenter extends ToolEllipse {



    compute = (evt) => {
        const x1 = Math.min(this.xInit, this.x);
        const y1 = Math.min(this.yInit, this.y);
        const x2 = Math.max(this.xInit, this.x);
        const y2 = Math.max(this.yInit, this.y);

        this.cx = this.xInit;
        this.cy = this.yInit;
        this.rx = Math.abs(this.x - this.xInit);
        this.ry = Math.abs(this.y - this.yInit);

        if(evt.shiftKey) {
            this.rx = Math.min(this.rx, this.ry);
            this.ry = Math.min(this.rx, this.ry);
        }

    }
    


}