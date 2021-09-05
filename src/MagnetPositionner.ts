import { BoardManager } from "./boardManager";

/**
 * this class enables to positionate automatically a collection of magnets (typically the magnets from the menu)
 */
export class MagnetPositionner {


    /**
     * put extra space because we start a new group of magnets
     */
    static newGroup(): void {
        this.magnetX += 100;
    }

    /**
     * the next position of the next magnet to be added
     */
    static magnetX = 0;
    static magnetY = 64;

    static magnetXseparation = 64;
    static magnetYseparation = 64;


    /**
    * @returns the top Y when a set of magnets is automatically arranged
    */
    static getYTopWhenNewMagnets(): number { return 64; }

    /**
     * set the seperation in pixels between two magnets
     */
    static setSeparationX(v: number): void {
        MagnetPositionner.magnetXseparation = v;
    }

    static setSeperationY(v: number): void {
        MagnetPositionner.magnetYseparation = v;
    }

    /**
     * reset the positionning variables
     */
    static resetPositionate(): void {
        MagnetPositionner.magnetX = BoardManager.getCurrentScreenRectangle().x1;
        MagnetPositionner.magnetY = MagnetPositionner.getYTopWhenNewMagnets();
        MagnetPositionner.magnetXseparation = 64;
        MagnetPositionner.magnetYseparation = 64;
    }


    /**
     * 
     * @param element 
     * @returns the very same magnet but by giving it the "next" position
     */
    static positionnate(element: HTMLElement): HTMLElement {
        if (MagnetPositionner.magnetX > BoardManager.getCurrentScreenRectangle().x2 - 10) {
            MagnetPositionner.magnetX = BoardManager.getCurrentScreenRectangle().x1;
            MagnetPositionner.magnetY += this.magnetYseparation;
        }
        if (element.style.left == "") {
            element.style.left = MagnetPositionner.magnetX + "px";
            element.style.top = MagnetPositionner.magnetY + "px";
        }
        MagnetPositionner.magnetX += this.magnetXseparation;
        return element;
    }
}