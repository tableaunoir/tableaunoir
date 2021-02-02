import { UserManager } from './UserManager';
import { Share } from './share';

export class S {
    static mousemove: ({ x, y }: { x: number, y: number }) => void = () => { };
    static magnetSetText(m: HTMLDivElement, text: string): void {
        m.innerHTML = text;
    }

    static round1(x: number): number {
        return Math.round(10 * x) / 10;
    }

    static setColor(c: string): void {
        Share.execute("setCurrentColor", [UserManager.me.userID, c]);
    }
}

window['S'] = S;