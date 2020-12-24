import { MagnetManager } from './magnetManager';


export class ConstraintDrawing {
    static readonly constraints = [];

    static line(svgLine: SVGLineElement, magnet1id: string, magnet2id: string) {
        ConstraintDrawing.constraints.push(() => {
            const magnet1 = document.getElementById(magnet1id);
            const magnet2 = document.getElementById(magnet2id);

            if (magnet1 == undefined || magnet2 == undefined) {
                svgLine.remove();
                return false;
            }

            const p1 = MagnetManager.getMagnetCenter(magnet1);
            const p2 = MagnetManager.getMagnetCenter(magnet2);
            svgLine.setAttributeNS(null, 'x1', "" + p1.x);
            svgLine.setAttributeNS(null, 'y1', "" + p1.y);
            svgLine.setAttributeNS(null, 'x2', "" + p2.x);
            svgLine.setAttributeNS(null, 'y2', "" + p2.y);

            return true;
        });
    }


    static update() {
        for (let i = 0; i < ConstraintDrawing.constraints.length; i++)
            if (!ConstraintDrawing.constraints[i]()) {
                ConstraintDrawing.constraints.splice(i, 1);
                return;
            }
    }

}