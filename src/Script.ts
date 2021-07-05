import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Share } from './share';


/** this class contains the method that can be used in scripts of Tableaunoir */
export class S {

    private static audioCtx: AudioContext;

    static boardReset(): void {
        Share.execute("boardReset", []);
    }

    static newOscillator(): OscillatorNode {
        if (!S.audioCtx)
            S.audioCtx = new (window.AudioContext);

        const oscillator = S.audioCtx.createOscillator();

        oscillator.type = 'sawtooth';
        oscillator.frequency.value = 440; // value in hertz
        oscillator.connect(S.audioCtx.destination);
        return oscillator;
    }

    static setFrequency(oscillator, frequency) {
        oscillator.frequency.value = frequency;
    }




    static playNote(frequency, duration) {
        if (!S.audioCtx)
            S.audioCtx = new (window.AudioContext);

        // create Oscillator node
        const oscillator = S.audioCtx.createOscillator();

        oscillator.type = 'square';
        oscillator.frequency.value = frequency; // value in hertz
        oscillator.connect(S.audioCtx.destination);
        oscillator.start();

        setTimeout(() => { oscillator.stop(); }, duration);
    }


    /** assign S.mousemove to execute sth when you move the chalk on the board */
    static onmousemove: ({ x, y }: { x: number, y: number }) => void = () => { /*do nothing*/ };
    static onkey: (keyname: string) => void = () => { /*do nothing*/ };
    static onupdate: () => void = () => { /*do nothing*/ };

    /**
     * @param a magnet m 
     * @param text 
     * @description modifies the text of a given magnet
     */
    static magnetSetText(magnet: HTMLDivElement, text: string): void { magnet.innerHTML = text; }

    /**
     * 
     * @param x 
     * @return the number x rounded with at most 1 digit after the dot
     */
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
        Share.execute("magnetMove", [magnet.id, cx - magnet.offsetWidth / 2, cy - magnet.offsetHeight / 2]);
    }

    /**
     * 
     * @param magnet 
     * @return the center of the magnet
     */
    static center(magnet: HTMLElement): { x: number, y: number } {
        return MagnetManager.getMagnetCenter(magnet);
    }

    /**
     * @return an array containing all the magnets
     */
    static getMagnets(): HTMLElement[] {
        const magnets = MagnetManager.getMagnets();

        const result = [];
        for (let i = 0; i < magnets.length; i++)
            result.push(magnets[i]);

        return result;

    }

    /**
     * 
     * @param point 
     * @param rectangle
     * @return true if the point is in the rectangle
     */
    static inRectangle({ x, y }: { x: number, y: number }, { x1, y1, x2, y2 }: { x1: number, y1: number, x2: number, y2: number }): boolean {
        return (x1 <= x) && (x <= x2) && (y1 <= y) && (y <= y2);
    }


    static magnetDrawingUnder(magnet: HTMLElement, x: number, y: number): boolean {
        const data = (<HTMLCanvasElement>document.getElementById("canvas")).getContext("2d").getImageData(x - 16, y - 16, 32, 32);
        for (let i = 0; i <= data.data.length - 1; i++)
            if (data.data[i] > 8)
                return true;
        return false;
    }

}


/**
 * @description makes that the script functionnality is available in Tableaunoir
 */
window['S'] = S;



export class Script {
    static isRun = false;
    static init(): void {
        document.getElementById("script").onkeydown = () => {/*do nothing*/ };
        document.getElementById("buttonScriptRun").onclick = Script.toggle;
    }


    static toggle(): void {
        if (Script.isRun) {
            Script.stop();
        }
        else Script.run();
    }

    static run(): void {
        Script.isRun = true;

        const step = () => {
            S.onupdate();
            if (Script.isRun)
                requestAnimationFrame(step);
        }

        eval((<HTMLTextAreaElement>document.getElementById("script")).value);

        step();
    }


    static stop(): void {
        Script.isRun = false;

        S.onkey = () => {/*nothing*/ };
        S.onmousemove = () => {/*nothing*/ };
        S.onupdate = () => {/*nothing*/ };
    }
}






window['Script'] = Script;





