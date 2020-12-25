import { Geometry } from './Geometry';
import { MagnetManager } from './magnetManager';


export class ConstraintDrawing {
    static readonly constraints = [];

    static line(svgLine: SVGLineElement, magnet1id: string, magnet2id: string): void {
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






    static freeDraw(svgLines: SVGLineElement[], magnet1id: string, magnet2id: string): void {
        const magnet1 = document.getElementById(magnet1id);
        const magnet2 = document.getElementById(magnet2id);

        const pm1 = MagnetManager.getMagnetCenter(magnet1);
        const pm2 = MagnetManager.getMagnetCenter(magnet2);
        const dm = (magnet1 == magnet2) ? 1 : Geometry.distance(pm1, pm2);
        const anglem = (magnet1 == magnet2) ? 0 : Geometry.angle(pm1, pm2);

        for (const svgLine of svgLines) {
            const p1 = { x: parseInt(svgLine.getAttributeNS(null, 'x1')), y: parseInt(svgLine.getAttributeNS(null, 'y1')) };
            const p2 = { x: parseInt(svgLine.getAttributeNS(null, 'x2')), y: parseInt(svgLine.getAttributeNS(null, 'y2')) };

            const d1 = Geometry.distance(pm1, p1) / dm;
            const angle1 = Geometry.angle(pm1, p1) - anglem;

            svgLine.dataset.d1 = "" + d1;
            svgLine.dataset.angle1 = "" + angle1;

            const d2 = Geometry.distance(pm1, p2) / dm;
            const angle2 = Geometry.angle(pm1, p2) - anglem;

            svgLine.dataset.d2 = "" + d2;
            svgLine.dataset.angle2 = "" + angle2;

        }




        ConstraintDrawing.constraints.push(() => {
            const magnet1 = document.getElementById(magnet1id);
            const magnet2 = document.getElementById(magnet2id);

            if (magnet1 == undefined || magnet2 == undefined) {
                for (const svgLine of svgLines)
                    svgLine.remove();
                return false;
            }

            const pm1 = MagnetManager.getMagnetCenter(magnet1);
            const pm2 = MagnetManager.getMagnetCenter(magnet2);
            const dm = (magnet1 == magnet2) ? 1 : Geometry.distance(pm1, pm2);
            const anglem = (magnet1 == magnet2) ? 0 : Geometry.angle(pm1, pm2);

            for (const svgLine of svgLines) {

                const dratio1 = parseFloat(svgLine.dataset.d1);
                const angle1 = parseFloat(svgLine.dataset.angle1);

                const dratio2 = parseFloat(svgLine.dataset.d2);
                const angle2 = parseFloat(svgLine.dataset.angle2);

                const p1 = Geometry.polar(pm1, dratio1 * dm, anglem + angle1);
                const p2 = Geometry.polar(pm1, dratio2 * dm, anglem + angle2);
                svgLine.setAttributeNS(null, 'x1', "" + p1.x);
                svgLine.setAttributeNS(null, 'y1', "" + p1.y);
                svgLine.setAttributeNS(null, 'x2', "" + p2.x);
                svgLine.setAttributeNS(null, 'y2', "" + p2.y);

            }

            return true;
        });
    }



    static update(): void {
        for (let i = 0; i < ConstraintDrawing.constraints.length; i++)
            if (!ConstraintDrawing.constraints[i]()) {
                ConstraintDrawing.constraints.splice(i, 1);
                return;
            }
    }

}