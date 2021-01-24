import { ActionSerialized } from './ActionSerialized';
import { ActionPrintMagnet } from './ActionPrintMagnet';
import { ActionClearZone } from './ActionClearZone';
import { ActionInit } from './ActionInit';
import { ActionErase } from './ActionErase';
import { ActionRectangle } from './ActionRectangle';
import { ActionEllipse } from './ActionEllipse';
import { Action } from "./Action";
import { ActionFreeDraw } from './ActionFreeDraw';
import { ActionLine } from './ActionLine';

export class ActionDeserializer {
    static deserialize(obj: ActionSerialized): Action {
        if (obj.type == "init")
            return new ActionInit(obj.userid, obj.canvasDataURL);
        if (obj.type == "ellipse")
            return new ActionEllipse(obj.userid, obj.cx, obj.cy, obj.rx, obj.ry, obj.color);
        if (obj.type == "rectangle")
            return new ActionRectangle(obj.userid, obj.x1, obj.y1, obj.x2, obj.y1, obj.color);
        if (obj.type == "line")
            return new ActionLine(obj.userid, obj.x1, obj.y1, obj.x2, obj.y1, obj.color);
        if (obj.type == "freedraw") {
            const action = new ActionFreeDraw(obj.userid);
            for (const point of obj.points)
                action.addPoint(point)
            return action;
        }
        if (obj.type == "erase") {
            const action = new ActionErase(obj.userid);
            for (const point of obj.points)
                action.addPoint(point)
            return action;
        }
        if(obj.type == "clearzone") {
            return new ActionClearZone(obj.userid, obj.points, obj.cut, obj.removeContour);
        }
        if(obj.type == "printmagnet") {
            return new ActionPrintMagnet(obj.userid, <HTMLImageElement> HTMLdeserialize(obj.magnet), obj.x, obj.y);
        }
        throw "ActionDeserializer: unknown type of action";
    }
}


/**
 * 
 * @param outerHTML 
 * @returns the HTML element whose code is outerHTML
 */
export function HTMLdeserialize(outerHTML: string): HTMLElement {
    const el = document.createElement("div");
    el.innerHTML = outerHTML;
    //console.log("HTMLdeserialize: " + outerHTML);
    return <HTMLElement> el.children[0];
}