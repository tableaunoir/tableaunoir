import { OptionManager } from './OptionManager';

export class Sound {
    static is: boolean = false;

    static init() {
        OptionManager.boolean({
            name: "sound",
            defaultValue: false,
            onChange: (s) => { Sound.is = s; }
        });
    }


    static play(name) {
        if (!Sound.is) return;

        const audio = new Audio("sounds/" + name + ".ogg");
        audio.play();
    }
}