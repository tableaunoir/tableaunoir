import { MinHeap } from './MinHeap';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Share } from './share';



/**
 * the graph where the nodes are the pixels that are not drawn
 */
export class PixelGraph {
    *getNeighbors(node: { x: number, y: number }): Generator<{ x: number, y: number }> {
        const up = { x: node.x, y: node.y - 1 };
        const down = { x: node.x, y: node.y + 1 };
        const left = { x: node.x - 1, y: node.y };
        const right = { x: node.x + 1, y: node.y };

        function* possibleYield(node) {
            if (!S.isPixel(node)) yield node;
        }

        yield* possibleYield(down);
        yield* possibleYield(up);
        yield* possibleYield(left);
        yield* possibleYield(right);

        yield* possibleYield({ x: node.x - 1, y: node.y - 1 });
        yield* possibleYield({ x: node.x - 1, y: node.y + 1 });
        yield* possibleYield({ x: node.x + 1, y: node.y + 1 });
        yield* possibleYield({ x: node.x + 1, y: node.y - 1 });

    }

    *getEdgesToNeighbors(node: { x: number, y: number }): Generator<{ node: { x: number, y: number }, weight: number }> {
        const up = { x: node.x, y: node.y - 1 };
        const down = { x: node.x, y: node.y + 1 };
        const left = { x: node.x - 1, y: node.y };
        const right = { x: node.x + 1, y: node.y };

        const dist = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

        function* possibleYield(n) { if (!S.isPixel(n)) yield { node: n, weight: dist(node, n) }; }

        yield* possibleYield(down);
        yield* possibleYield(up);
        yield* possibleYield(left);
        yield* possibleYield(right);

        yield* possibleYield({ x: node.x - 1, y: node.y - 1 });
        yield* possibleYield({ x: node.x - 1, y: node.y + 1 });
        yield* possibleYield({ x: node.x + 1, y: node.y + 1 });
        yield* possibleYield({ x: node.x + 1, y: node.y - 1 });

    }
}


window["MinHeap"] = MinHeap;
window["PixelGraph"] = PixelGraph;

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

    static setFrequency(oscillator: OscillatorNode, frequency: number): void {
        oscillator.frequency.value = frequency;
    }


    /**
     * shake a magnet during 500ms
     */
    static shake(magnet: HTMLElement): void {
        magnet.classList.add("shake");
        setTimeout(() => { magnet.classList.remove("shake");}, 500);
    }


    static playNote(frequency: number, duration: number): void {
        if (!S.audioCtx)
            S.audioCtx = new (window.AudioContext);

        // create Oscillator node
        const oscillator = S.audioCtx.createOscillator();

        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency; // value in hertz
        oscillator.connect(S.audioCtx.destination);
        oscillator.start();

        setTimeout(() => { oscillator.stop(); }, duration);
    }


    /** assign S.mousemove to execute sth when you move the chalk on the board */
    static onmagnetmousedown: (evt) => void = () => { /*do nothing*/ };
    static onmousemove: ({ x, y }: { x: number, y: number }) => void = () => { /*do nothing*/ };
    static onkey: (keyname: string) => void = () => { /*do nothing*/ };
    static onupdate: () => void = () => { /*do nothing*/ };
    static onmagnetmove: (evt) => void = () => { /*do nothing*/ };

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
    static magnetCenter(magnet: HTMLElement): { x: number, y: number } {
        return MagnetManager.getMagnetCenter(magnet);
    }


    /**
 * 
 * @param magnet 
 * @return the center of the magnet
 */
    static magnetMiddleBottom(magnet: HTMLElement): { x: number, y: number } {
        return MagnetManager.getMagnetMiddleButton(magnet);
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

    /**
     * 
     * @param param0 
     * @returns the color of the pixel
     */
    static getPixel({ x, y }: { x: number, y: number }): string {
        const data = (<HTMLCanvasElement>document.getElementById("canvas")).getContext("2d").getImageData(x, y, 1, 1);
        const r = data.data[0];
        const g = data.data[1];
        const b = data.data[2];
        const a = data.data[3];
        return "rgba(" + [r, g, b, a].join(",") + ")";
    }


    /**
     * 
     * @param point 
     * @returns the color of the pixel
     */
    static setPixel({ x, y }: { x: number, y: number }, color: string): void {
        const ctx = (<HTMLCanvasElement>document.getElementById("canvas")).getContext("2d");
        ctx.fillStyle = color;
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1.0;
        ctx.fillRect(x, y, 1, 1);
    }


    /**
     * @param point
     * @description remove the color in the pixel
     */
    static clearPixel({ x, y }: { x: number, y: number }): void {
        const ctx = (<HTMLCanvasElement>document.getElementById("canvas")).getContext("2d");
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = `rgba(${255},${255},${255},${1})`;
        ctx.fillRect(x, y, 1, 1);
    }

    /**
     * @param a position on the board
     * @returns true if the pixel has a color and is not transparent
     */
    static isPixel({ x, y }: { x: number, y: number }): boolean {
        const data = (<HTMLCanvasElement>document.getElementById("canvas")).getContext("2d").getImageData(x, y, 1, 1);
        const a = data.data[3];
        return a > 128;
    }



    static set nbUpdatePerCycle(v: number) {
        if (1 <= v && v <= 1000)
            Script.nbUpdatePerCycle = v;
        else
            throw "the number of update per cycle should be between 1 and 1000"
    }

    /**
     * @description stops the script (i.e. it unplugs the onmousemove, onupdate events, etc.)
     */
    static stop(): void {
        Script.stop();
    }

}


/**
 * @description makes that the script functionnality is available in Tableaunoir
 */
window['S'] = S;



export class Script {
    static nbUpdatePerCycle = 1;

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
            for (let i = 0; i < Script.nbUpdatePerCycle; i++)
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
        S.onmagnetmousedown = () => {/*nothing*/ };
        S.onmagnetmove = () => {/*nothing*/ };
    }
}






window['Script'] = Script;



