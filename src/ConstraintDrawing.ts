import { Geometry } from './Geometry';
import { MagnetManager } from './magnetManager';


export class ConstraintDrawing {
    /**
     * array of constraints that are functions that updates some SVG elements according to magnets' position
     * such a function returns true if everything is fine and false if a magnet was not there, in that case, the constraint is removed
     */
    private static constraints: (() => boolean)[] = [];

    /**
     * 
     * @param svgLine  
     * @description maybe add the constraint function for that line (or nothing if there is nothing to add)
     */
    private static line(svgLine: SVGLineElement): void {
        const magnet1id = svgLine.dataset.magnet1id;
        const magnet2id = svgLine.dataset.magnet2id;

        if (magnet1id && magnet2id) {

            ConstraintDrawing.constraints.push(() => {
                const magnet1 = document.getElementById(magnet1id);
                const magnet2 = document.getElementById(magnet2id);

                if (magnet1 == undefined || magnet2 == undefined) {
                    svgLine.remove();
                    return false;
                }

                const pm1 = MagnetManager.getMagnetCenter(magnet1);
                const pm2 = MagnetManager.getMagnetCenter(magnet2);

                const getSize = (magnet) => Math.min(magnet1.clientHeight, magnet1.clientWidth);
                const size1 = getSize(magnet1);
                const size2 = getSize(magnet2);
                const dtotal = parseFloat(svgLine.dataset.d);
                const dm = (magnet1 == magnet2) ? 1 : Geometry.distance(pm1, pm2);
                const anglem = (magnet1 == magnet2) ? 0 : Geometry.angle(pm1, pm2);

                const getNewPosition = (d, angle) => {
                    const dratio = d / parseFloat(svgLine.dataset.d);
                    return Geometry.polar(pm1, dratio * dm, anglem + angle);
                };

                const p1 = getNewPosition(parseFloat(svgLine.dataset.d1), parseFloat(svgLine.dataset.angle1));
                const p2 = getNewPosition(parseFloat(svgLine.dataset.d2), parseFloat(svgLine.dataset.angle2));
                
                svgLine.setAttributeNS(null, 'x1', "" + p1.x);
                svgLine.setAttributeNS(null, 'y1', "" + p1.y);
                svgLine.setAttributeNS(null, 'x2', "" + p2.x);
                svgLine.setAttributeNS(null, 'y2', "" + p2.y);
                return true;
            });

        }
    }





    /**
     * 
     * @param svgLines 
     * @param magnet1id 
     * @param magnet2id
     * @description adds constraints for the svgLines to be between magnet1 and magnet2 
     */
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

            const d1 = Geometry.distance(pm1, p1);
            const angle1 = Geometry.angle(pm1, p1) - anglem;

            svgLine.dataset.magnet1id = magnet1id;
            svgLine.dataset.magnet2id = magnet2id;
            svgLine.dataset.d1 = "" + d1;
            svgLine.dataset.angle1 = "" + angle1;
            svgLine.dataset.d = "" + dm;

            const d2 = Geometry.distance(pm1, p2);
            const angle2 = Geometry.angle(pm1, p2) - anglem;

            svgLine.dataset.d2 = "" + d2;
            svgLine.dataset.angle2 = "" + angle2;

            ConstraintDrawing.line(svgLine);
        }

    }


    /**
     * @description apply the constraint
     */
    static update(): void {
        let i = 0;
        while (i < ConstraintDrawing.constraints.length) {
            if (ConstraintDrawing.constraints[i]())
                i++;
            else // if the constraint failed, we remove it
                ConstraintDrawing.constraints.splice(i, 1);
        }
    }



    /**
     * @description reset all the constraints
     * reads all the svg lines of the current board, and for each them, look whether there is a constraint. If yes, add it.
     */
    static reset(): void {
        const svgLines = document.getElementsByTagName("line");

        ConstraintDrawing.constraints = [];
        for (let i = 0; i < svgLines.length; i++)
            ConstraintDrawing.line(svgLines[i]);
    }
}