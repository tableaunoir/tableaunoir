import { UserManager } from './UserManager';
import { ActionMagnetMove } from './ActionMagnetMove';
import { BoardManager } from './boardManager';
import { ConstraintDrawing } from './ConstraintDrawing';

/**
 * this class stores the movement of the magnets for then storing actions that are magnet movement
 */
export class MagnetMovementRecorder {

    /**
     * stores the points during the movement of a magnet
     */
    static magnetIDToPoints = {};

    /**
     * 
     * @param id 
     * @description start a new movement of magnet of id id
     */
    static start(id: string): void { MagnetMovementRecorder.magnetIDToPoints[id] = []; }

    /**
     * 
     * @param id 
     * @param x 
     * @param y 
     * @description move the magnet at position x and y and stores that action
     */
    static move(id: string, x: number, y: number): void {
        const magnet = document.getElementById(id);


        MagnetMovementUpdater.update(magnet, x, y);

     
        ConstraintDrawing.update();

        if (MagnetMovementRecorder.magnetIDToPoints[id])
            MagnetMovementRecorder.magnetIDToPoints[id].push({ x: x, y: y });
    }


    /**
     * 
     * @param id 
     * * @description stops the movement of magnet of id id and stores the corresponding action
     */
    static stop(id: string): void {
        //TODO: the user may not be me
        console.log(`number of points in the movement of magnet: ${MagnetMovementRecorder.magnetIDToPoints[id].length}`);

        //add an action of moving the magnet if there are some points in the movement
        if (MagnetMovementRecorder.magnetIDToPoints[id].length > 0)
            BoardManager.addAction(new ActionMagnetMove(UserManager.me.userID, id, MagnetMovementRecorder.magnetIDToPoints[id]));
        delete MagnetMovementRecorder.magnetIDToPoints[id];
    }
}













export class MagnetMovementUpdater {
    static update(magnet: HTMLElement, x: number, y: number): void {
        const previousx = parseFloat(magnet.style.left);
        const previousy = parseFloat(magnet.style.top);

        if (magnet.classList.contains("car"))
            MagnetMovementUpdater.carUpdate(magnet, x, y, previousx, previousy);
        else
            MagnetMovementUpdater.simpleUpdate(magnet, x, y);

    }

    private static simpleUpdate(magnet: HTMLElement, x: number, y: number) {
        magnet.style.top = y + "px";
        magnet.style.left = x + "px";
    }



    private static previousAngle = 0;

    private static carUpdate(magnet: HTMLElement, x: number, y: number, previousx: number, previousy: number): void {
        MagnetMovementUpdater.simpleUpdate(magnet, x, y);

        // const previousAngle = magnet.style.rotate ? parseInt(magnet.style.rotate) : 0;
        const angle = Math.atan2(y - previousy, x - previousx);

        if (Math.abs(MagnetMovementUpdater.previousAngle - angle) <= 0.1)
            magnet.style.transform = `rotate${angle}rad)`;

        MagnetMovementUpdater.previousAngle = angle;
    }
}