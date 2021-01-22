import { OptionManager } from './OptionManager';

export class Sound {
    static is = false;

    static init(): void {
        OptionManager.boolean({
            name: "sound",
            defaultValue: false,
            onChange: (s) => { Sound.is = s; }
        });
    }


    static play(name: string):void {
        if (!Sound.is) return;

        const audio = new Audio("sounds/" + name + ".ogg");
        audio.play();
    }
}