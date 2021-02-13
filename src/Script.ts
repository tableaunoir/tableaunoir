import { UserManager } from './UserManager';
import { Share } from './share';


/** this class contains the method that can be used in scripts of Tableaunoir */
export class S {
    /** assign S.mousemove to execute sth when you move the chalk on the board */
    static mousemove: ({ x, y }: { x: number, y: number }) => void = () => { /*do nothing*/ };

    /**
     * @param a magnet m 
     * @param text 
     * @description modifies the text of a given magnet
     */
    static magnetSetText(magnet: HTMLDivElement, text: string): void { magnet.innerHTML = text; }


    static round1(x: number): number { return Math.round(10 * x) / 10; }

    /**
     * @param c 
     * @description modifies the color of the chalk
     */
    static setColor(c: string): void {
        Share.execute("setCurrentColor", [UserManager.me.userID, c]);
    }

    /**
     * @param magnet 
     * @param cx 
     * @param cy 
     * @description move the magnet (the center of the magnet is at cx, cy)
     */
    static magnetMove(magnet: HTMLDivElement, cx: number, cy: number): void {
        Share.execute("magnetMove", [magnet.id, cx - magnet.offsetWidth/2, cy - magnet.offsetHeight/2]);
    }
}

window['S'] = S;



export class Script {
    static init(): void {
        document.getElementById("script").onkeydown = () => {/*do nothing*/ };
    }
}
