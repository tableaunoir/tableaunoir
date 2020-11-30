import { Delineation } from './Delineation';
import { ToolEllipseByCenter } from './ToolEllipseByCenter';
import { ToolEllipseByBorder } from './ToolEllipseByBorder';
import { ToolLine } from './ToolLine';
import { CircularMenu } from './CircularMenu';
import { ToolRectangle } from './ToolRectangle';
import { ToolDraw } from './ToolDraw';
import { ToolEraser } from './ToolEraser';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Tool } from './Tool';
import { ToolAbstractShape } from './ToolAbstractShape';
import { ToolArc } from './ToolArc';




/**
 * Represents a user (maybe you?)
 */
export class User {
    isToolDraw(): boolean { return this.tool instanceof ToolDraw; }
    get isToolErase(): boolean { return this.tool instanceof ToolEraser; }

    get x(): number { return this.tool.x; }
    get y(): number { return this.tool.y; }

    alreadyDrawnSth = false; // true if something visible has been drawn (If still false, draw a dot)
    canWrite = true;
    color = "white";
    cursor = undefined;
    tool: Tool = undefined;
    elementName = undefined;
    userID = "0";
    private _name = "";

    get name(): string { return this._name; }

    set name(newName: string) {
        this._name = newName;
        if (!this.isCurrentUser)
            this.elementName.innerHTML = this._name;
    }

    get isDelineation(): boolean {
        return this.tool instanceof ToolDraw || this.tool instanceof ToolAbstractShape;
    }

    get lastDelineation(): Delineation {
        return (<ToolDraw | ToolAbstractShape>this.tool).lastDelineation;
    }

    

    setUserID(userID: string): void { this.userID = userID; }

    setCanWrite(bool: boolean): void { this.canWrite = bool; }

    /**
     *
     * @param {*} isCurrentUser that tells whether the user is the current one
     * @description create the user.
     */
    constructor(isCurrentUser: boolean) {
        if (!isCurrentUser) {
            this.cursor = document.createElement("div");
            this.cursor.classList.add("cursor");
            this.elementName = document.createElement("div");
            this.elementName.classList.add("userNameCursor");
            document.getElementById("cursors").appendChild(this.cursor);
            document.getElementById("cursors").appendChild(this.elementName);
        }

        this.tool = new ToolDraw(this);
    }



    /**
     * @returns true iff the user is the current user (the one that controls the mouse)
     */
    get isCurrentUser(): boolean { return (this == UserManager.me); }

    /**
     * tells that the user has disconnected
     */
    destroy(): void {
        document.getElementById("cursors").removeChild(this.cursor);
        this.elementName.remove();
    }

    setCurrentColor(color: string): void {
        this.color = color;
        this.tool.updateCursor();
    }

    getCurrentColor(): string {
        return this.color;
    }



    switchChalk(): void { this.tool.destructor(); this.tool = new ToolDraw(this); }
    switchErase(): void { this.tool.destructor(); this.tool = new ToolEraser(this); }
    switchLine(): void { this.tool.destructor(); this.tool = new ToolLine(this); }
    switchRectangle(): void { this.tool.destructor(); this.tool = new ToolRectangle(this); }
    switchEllipseByBorder(): void { this.tool.destructor(); this.tool = new ToolEllipseByBorder(this); }
    switchEllipseByCenter(): void { this.tool.destructor(); this.tool = new ToolEllipseByCenter(this); }
    switchArc(): void { this.tool.destructor(); this.tool = new ToolArc(this); }


    mousedown(evt: MouseEvent): void {
        MagnetManager.setInteractable(false);

        //unselect the selected element (e.g. a text in edit mode)
        (<HTMLElement>document.activeElement).blur();

        this.tool.isDrawing = true;

        //console.log("mousedown")
        this.tool.x = evt.offsetX;
        this.tool.y = evt.offsetY;
        this.tool.xInit = this.tool.x;
        this.tool.yInit = this.tool.y;

        if (this.canWrite)
            this.tool.mousedown(evt);

        if (this.isCurrentUser)
            CircularMenu.hide();
    }



    mousemove(evt: MouseEvent): void {
        const evtX = evt.offsetX;
        const evtY = evt.offsetY;

        if (!this.isCurrentUser) {
            this.cursor.style.left = evtX - 8;
            this.cursor.style.top = evtY - 8;
            this.elementName.style.left = evtX - 8;
            this.elementName.style.top = evtY + 8;
        }

        if (this.canWrite) {
            this.tool.mousemove(evt);
        }

        this.tool.x = evtX;
        this.tool.y = evtY;
    }


    mouseup(evt: MouseEvent): void {
        MagnetManager.setInteractable(true);

        if (this.canWrite)
            this.tool.mouseup(evt);

        this.tool.isDrawing = false;
    }
}
