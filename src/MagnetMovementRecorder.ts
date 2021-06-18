import { ActionMagnetMove } from './ActionMagnetMove';
import { BoardManager } from './boardManager';
import { ConstraintDrawing } from './ConstraintDrawing';

/**
 * this class stores the movement of the magnets for then storing actions that are magnet movement
 */
export class MagnetMovementRecorder {

    static magnetIDToPoints = {};

    /**
     * 
     * @param id 
     * @description start a new movement of magnet of id id
     */
    static start(id: string): void {
        MagnetMovementRecorder.magnetIDToPoints[id] = [];
    }

    /**
     * 
     * @param id 
     * @param x 
     * @param y 
     * @description move the magnet at position x and y and stores that action
     */
    static move(id: string, x: number, y: number): void {
        const el = document.getElementById(id);
        el.style.top = y + "px";
        el.style.left = x + "px";
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
        BoardManager.addAction(new ActionMagnetMove(undefined, id, MagnetMovementRecorder.magnetIDToPoints[id]));
        delete MagnetMovementRecorder.magnetIDToPoints[id];
    }
}