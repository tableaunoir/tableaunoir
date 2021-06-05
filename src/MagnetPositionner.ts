import { BoardManager } from "./boardManager";

/**
 * this class enables to positionate automatically a collection of magnets (typically the magnets from the menu)
 */
export class MagnetPositionner {
    static magnetX = 0;
    static magnetY = 64;


    /**
    * @returns the top Y when a set of magnets is automatically arranged
    */
    static getYTopWhenNewMagnets(): number { return 64; }

    /**
     * reset the positionning variables
     */
    static resetPositionate(): void {
        MagnetPositionner.magnetX = BoardManager.getCurrentScreenRectangle().x1;
        MagnetPositionner.magnetY = MagnetPositionner.getYTopWhenNewMagnets();
    }


/**
 * 
 * @param element 
 * @returns the very same magnet but by giving it the "next" position
 */
    static positionnate(element: HTMLElement): HTMLElement {
        if (MagnetPositionner.magnetX > BoardManager.getCurrentScreenRectangle().x2 - 10) {
			MagnetPositionner.magnetX = BoardManager.getCurrentScreenRectangle().x1;
			MagnetPositionner.magnetY += 64;
		}
		if (element.style.left == "") {
			element.style.left = MagnetPositionner.magnetX + "px";
			element.style.top = MagnetPositionner.magnetY + "px";
		}
		MagnetPositionner.magnetX += 64;
        return element;
    }
}