import { OptionManager } from './OptionManager';
import { User } from './User';


/**
 * This is an abstract tool (like erasing, drawing, drawing a line, rectangle, drawing a circle)
 */
export abstract class Tool {
    readonly abstract name: string;
    xInit = 0;
    yInit = 0;

    x = 0;
    y = 0;

    isDrawing = false;
    user: User;

    constructor(user: User) {
        this.user = user;
    }


    static cursorVisible = true;
    static cursor: string;

    static init(): void {
        OptionManager.boolean({
            name: "cursorVisible",
            defaultValue: true,
            onChange: (b) => {
                Tool.cursorVisible = b;
                document.getElementById("canvas").style.cursor = Tool.cursorVisible ? Tool.cursor : "none";
            }
        });
    }

    destructor(): void {
        //empty destructur
    }

    abstract mousedown(evt: MouseEvent): void;
    abstract mousemove(evt: MouseEvent): void;
    abstract mouseup(evt: MouseEvent): void;



    setToolCursorImage(srcImage: { data: string, x: number, y: number }): void {
        Tool.cursor = `url(${srcImage.data}) ${srcImage.x} ${srcImage.y}, auto`;
        document.getElementById("canvas").style.cursor = Tool.cursorVisible ? Tool.cursor : "none";

        // this.toolCursor.src = srcImage;
    }

    updateCursor(): void {
        //by defaut: do nothing
    }
}