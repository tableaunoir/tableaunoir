import { User } from './User';


/**
 * This is an abstract tool (like erasing, drawing, drawing a line, srectangle, drawing a circle)
 */
export abstract class Tool {
    xInit = 0;
    yInit = 0;

    x = 0;
    y = 0;

    isDrawing = false;
    user: User;

    constructor(user: User) {
        this.user = user;
    }

    abstract init(): void;
    abstract mousedown(evt): void;
    abstract mousemove(evt): void;
    abstract mouseup(evt): void;
    


    setToolCursorImage(srcImage: { data: string, x: number, y: number }): void {
        document.getElementById("canvas").style.cursor = `url(${srcImage.data}) ${srcImage.x} ${srcImage.y}, auto`;
        // this.toolCursor.src = srcImage;
    }

    updateCursor() {
    }
}