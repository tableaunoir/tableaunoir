import { DrawingSVG } from './DrawingSVG';
import { DrawingCanvas } from './DrawingCanvas';
import { BlackVSWhiteBoard } from './BlackVSWhiteBoard';
import { OptionManager } from './OptionManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { getCanvas } from './main';
import { Layout } from './Layout';


/**
 * general drawing class
 */
export class Drawing extends DrawingCanvas {

    static lineWidth: number;


    static init(): void {
        OptionManager.number({
            name: "lineWidth",
            defaultValue: 1.5,
            onChange: (lineWidth) => this.lineWidth = lineWidth
        });
    }
   

    static divideScreen(): void {
        console.log("divide the screen")
        const x = Layout.getXMiddle();
        Drawing.drawLine(getCanvas().getContext("2d"), x, 0, x, Layout.getWindowHeight(), 1,
            BlackVSWhiteBoard.getDefaultChalkColor());
        BoardManager.saveCurrentScreen();
    }

}
