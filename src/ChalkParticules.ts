/**
 * @description This class handles the chalk particules, which makes the drawing a bit more realistic 
 * (almost magical ;) ).
 */
export class ChalkParticules {
    private static createParticle(x: number, y: number, maxvelocity: number, color: string) {
        const svgns = "http://www.w3.org/2000/svg";
        const shape = <SVGEllipseElement>document.createElementNS(svgns, 'ellipse');

        const r = 1 + 2 * Math.random();
        shape.setAttributeNS(null, 'cx', "" + x);
        shape.setAttributeNS(null, 'cy', "" + y);
        shape.setAttributeNS(null, 'rx', "" + r);
        shape.setAttributeNS(null, 'ry', "" + r);
        shape.setAttributeNS(null, 'fill', color);
        shape.style.pointerEvents = "none";

        shape.dataset["vx"] = "" + (2 * maxvelocity * Math.random() - maxvelocity);
        shape.dataset["vy"] = "" + (2 * maxvelocity * Math.random() - maxvelocity);
        shape.dataset["t"] = "0";
        return shape;
    }

    /**
     * 
     * @param x 
     * @param y 
     * @param maxvelocity 
     * @param color 
     * @param nb 
     * @description create nb particules starting at point (x, y) with maximum velocity maxvelocity
     */
    static start(x: number, y: number, maxvelocity: number, color: string, nb = 5) {
        for (let i = 0; i < nb; i++) {
            const particule = ChalkParticules.createParticle(x, y, 20 * maxvelocity, color);
            document.getElementById("svg").appendChild(particule);

            const live = () => {
                if (parseInt(particule.dataset["t"]) > 4)
                    document.getElementById("svg").removeChild(particule); //the particule dies
                else {
                    const gravity = 10;
                    particule.setAttribute('cx', "" + (particule.cx.baseVal.value + parseFloat(particule.dataset["vx"])));
                    particule.setAttribute('cy', "" + (particule.cy.baseVal.value + parseFloat(particule.dataset["vy"])
                        + parseInt(particule.dataset["t"]) * gravity));
                    particule.dataset["t"] = "" + (parseInt(particule.dataset["t"]) + 1);
                    particule.style.opacity = "" + ((5 - parseInt(particule.dataset["t"])) / 5);
                    setTimeout(live, 100);
                }
            }
            live();
        }
    }
}