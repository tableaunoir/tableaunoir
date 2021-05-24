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
            if (magnet1id == magnet2id)
                ConstraintDrawing.constraints.push(() => {
                    const magnet1 = document.getElementById(magnet1id);

                    if (magnet1 == undefined) {
                        svgLine.remove();
                        return false;
                    }

                    const pm1 = MagnetManager.getMagnetCenter(magnet1);



                    const getNewPosition = (x: number, y: number) => {
                        return { x: pm1.x + x, y: pm1.y + y };
                    };

                    const p1 = getNewPosition(parseFloat(svgLine.dataset.refx1), parseFloat(svgLine.dataset.refy1));
                    const p2 = getNewPosition(parseFloat(svgLine.dataset.refx2), parseFloat(svgLine.dataset.refy2));

                    svgLine.setAttributeNS(null, 'x1', "" + p1.x);
                    svgLine.setAttributeNS(null, 'y1', "" + p1.y);
                    svgLine.setAttributeNS(null, 'x2', "" + p2.x);
                    svgLine.setAttributeNS(null, 'y2', "" + p2.y);
                    return true;
                });
            else //two different magnets

                ConstraintDrawing.constraints.push(() => {
                    const magnet1 = document.getElementById(magnet1id);
                    const magnet2 = document.getElementById(magnet2id);

                    if (magnet1 == undefined || magnet2 == undefined) {
                        svgLine.remove();
                        return false;
                    }

                    const pm1 = MagnetManager.getMagnetCenter(magnet1);
                    const pm2 = MagnetManager.getMagnetCenter(magnet2);

                    const getSize = (magnet) => Math.min(magnet.clientHeight, magnet.clientWidth);
                    const size1 = getSize(magnet1);
                    const size2 = getSize(magnet2);

                    const refd = parseFloat(svgLine.dataset.refd);
                    const d = Geometry.distance(pm1, pm2);

                    const getNewPosition = (refx: number, refy: number) => {
                        const vectorDirection = Geometry.normalize({ x: pm2.x - pm1.x, y: pm2.y - pm1.y });
                        const vectorOrtho = { x: -vectorDirection.y, y: vectorDirection.x };

                        const pos = (x: number, y: number) => {
                            return {
                                x: pm1.x + vectorDirection.x * x + vectorOrtho.x * y,
                                y: pm1.y + vectorDirection.y * x + vectorOrtho.y * y
                            }
                        };

                         if (refx < size1) {
                             return pos(refx, refy);
                         }
                         else if (refx > refd - size2)
                             return pos(d - (refd - refx), refy);
                         else {
                             const dratio = (refx - size1) / (refd - size1 - size2);
                             return pos(size1 + dratio * (d - size1 - size2), refy);
                         }
                        //return pos(refx * d / refd, refy);
                    };

                    const p1 = getNewPosition(parseFloat(svgLine.dataset.refx1), parseFloat(svgLine.dataset.refy1));
                    const p2 = getNewPosition(parseFloat(svgLine.dataset.refx2), parseFloat(svgLine.dataset.refy2));

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
        const pm1 = MagnetManager.getMagnetCenter(magnet1);

        const magnet2 = document.getElementById(magnet2id);
        const pm2 = MagnetManager.getMagnetCenter(magnet2);

        const d = (magnet1 == magnet2) ? 1 : Geometry.distance(pm1, pm2);

        let getInfoFromPoint: (p: { x: number, y: number }) => { x: number, y: number };
        if (magnet1id == magnet2id)
            getInfoFromPoint = (p: { x: number, y: number }) => ({ x: p.x - pm1.x, y: p.y - pm1.y });
        else
            getInfoFromPoint = (p: { x: number, y: number }) => Geometry.getNewCoordinates(p, pm1, pm2);

        for (const svgLine of svgLines) {
            const p1 = { x: parseFloat(svgLine.getAttributeNS(null, 'x1')), y: parseFloat(svgLine.getAttributeNS(null, 'y1')) };
            const p2 = { x: parseFloat(svgLine.getAttributeNS(null, 'x2')), y: parseFloat(svgLine.getAttributeNS(null, 'y2')) };

            const info1 = getInfoFromPoint(p1);
            const info2 = getInfoFromPoint(p2);

            /**
             * store the information of the constraint in the SVG object
             */
            svgLine.dataset.magnet1id = magnet1id;
            svgLine.dataset.magnet2id = magnet2id;
            svgLine.dataset.refd = "" + d;
            svgLine.dataset.refx1 = "" + info1.x;
            svgLine.dataset.refy1 = "" + info1.y;
            svgLine.dataset.refx2 = "" + info2.x;
            svgLine.dataset.refy2 = "" + info2.y;

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