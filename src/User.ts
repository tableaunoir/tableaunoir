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
import { Layout } from './Layout';





/**
 * Represents a user (maybe you? ;) )
 */
export class User {
    get isToolDraw(): boolean { return this.tool instanceof ToolDraw; }
    get isToolErase(): boolean { return this.tool instanceof ToolEraser; }

    /**
     * @returns the position x and y of the user cursor
     */
    get x(): number { return this.tool.x; }
    get y(): number { return this.tool.y; }

    canWrite = true; //permission of writing for that user

    color = "white";
    private cursor = undefined;
    tool: Tool = undefined;
    private elementName = undefined;
    userID = "0";
    private _name = "";
    isRoot = false;

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

    private lastHearBeat = Date.now();

    recordHeartBeat(): void {
        this.lastHearBeat = Date.now();
    }

    /**
     * @returns true if there are some recent news from the user
     * (if it is you, perfect otherwise we look whether we received some heartbeat recently)
     */
    isAlive(): boolean {
        if (this == UserManager.me)
            return true;
        else
            return Date.now() - this.lastHearBeat < 10000;
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
            this.cursor.classList.add("cursorinscreen");
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


    //changing tools. The 2 style editions per line for the following statements are used to switch the eraser gauge display
    switchDraw(): void { this.tool.destructor(); this.tool = new ToolDraw(this); }
    switchEraser(): void { this.tool.destructor(); CircularMenu.hide(); this.tool = new ToolEraser(this); }
    switchLine(): void { this.tool.destructor(); this.tool = new ToolLine(this); }
    switchRectangle(): void { this.tool.destructor(); this.tool = new ToolRectangle(this); }
    switchEllipseByBorder(): void { this.tool.destructor(); this.tool = new ToolEllipseByBorder(this); }
    switchEllipseByCenter(): void { this.tool.destructor(); this.tool = new ToolEllipseByCenter(this); }
    switchArc(): void { this.tool.destructor(); this.tool = new ToolArc(this); }


    mousedown(evt: MouseEvent): void {
        if (this.isCurrentUser) {
            MagnetManager.setInteractable(false);
            //unselect the selected element (e.g. a text in edit mode)
            (<HTMLElement>document.activeElement).blur();
            CircularMenu.hide();
        }

        this.tool.isDrawing = true;

        //console.log("mousedown")
        this.tool.x = evt.offsetX;
        this.tool.y = evt.offsetY;
        this.tool.xInit = this.tool.x;
        this.tool.yInit = this.tool.y;

        if (this.canWrite)
            this.tool.mousedown(evt);
    }





    /**
     * 
     * @param x 
     * @param y 
     * @description set the position of the cursor (for another user than me)
     */
    setSymbolCursorPosition(): void {
        let x = this.tool.x;
        const y = this.tool.y;
        this.cursor.classList.remove("cursortoleft");
        this.cursor.classList.remove("cursortoright");
        this.cursor.classList.remove("cursorinscreen");

        if (x <= Layout.getWindowLeft()) {
            this.cursor.classList.add("cursortoleft");
            x = Layout.getWindowLeft() + 24;
        }
        else if (x >= Layout.getWindowRight()) {
            this.cursor.classList.add("cursortoright");
            x = Layout.getWindowRight() - 24;
        }
        else {
            this.cursor.classList.add("cursorinscreen");
        }
        this.cursor.style.left = x - 8;
        this.cursor.style.top = y - 8;
        this.elementName.style.left = x - 8;
        this.elementName.style.top = y + 8;
    }

    mousemove(evt: MouseEvent): void {
        const evtX = evt.offsetX;
        const evtY = evt.offsetY;

        if (this.canWrite) {
            this.tool.mousemove(evt);
        }

        this.tool.x = evtX;
        this.tool.y = evtY;

        if (!this.isCurrentUser) {
            this.setSymbolCursorPosition();
        }
    }


    mouseup(evt: MouseEvent): void {
        if (this.isCurrentUser)
            MagnetManager.setInteractable(true);

        if (this.canWrite)
            this.tool.mouseup(evt);

        this.tool.isDrawing = false;
    }
}
