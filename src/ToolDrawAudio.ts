import { Sound } from "./Sound";

export class ToolDrawAudio {
    static audioChalkDown: HTMLAudioElement = new Audio("sounds/chalkdown.ogg");
    static audioChalkMove: HTMLAudioElement = new Audio("sounds/chalkmove.ogg");

    static mousedown(p: number): void {
        if (!Sound.is) return;
        ToolDrawAudio.audioChalkDown.pause();
        ToolDrawAudio.audioChalkDown.currentTime = 0;
        ToolDrawAudio.audioChalkDown.volume = p;
        ToolDrawAudio.audioChalkDown.play();
        ToolDrawAudio.audioChalkMove.loop = true;
    }


    static mousemove(d: number): void {
        if (!Sound.is) return;

        if (d <= 2) {
            ToolDrawAudio.audioChalkMove.pause();
        }
        else {
            ToolDrawAudio.audioChalkMove.volume = Math.min(1, d / 150);
            if (ToolDrawAudio.audioChalkMove.paused) {
                ToolDrawAudio.audioChalkMove.play();
            }
        }
    }


    static mouseup(): void {
        if (!Sound.is) return;
        ToolDrawAudio.audioChalkDown.pause();
        ToolDrawAudio.audioChalkMove.pause();
        ToolDrawAudio.audioChalkDown.currentTime = 0;
        ToolDrawAudio.audioChalkMove.currentTime = 0;
    }

}