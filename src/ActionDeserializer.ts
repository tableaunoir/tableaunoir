import { ActionMagnetChangeSizeRatio } from './ActionMagnetChangeSizeRatio';
import { ActionFill } from './ActionFill';
import { ActionMagnetSwitchBackgroundForeground } from './ActionMagnetSwitchBackgroundForeground';
import { ActionMagnetNew } from './ActionMagnetNew';
import { ActionMagnetMove } from './ActionMagnetMove';
import { ActionMagnetDelete } from './ActionMagnetDelete';
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
import { ActionClear } from './ActionClear';
import { ActionSlideStart } from './ActionSlideStart';


/**
 * @description this class enables to obtain the real Action object (draw a line, erase that part, etc.)
 * from its serialized version (the one stored in a file)
 */
export class ActionDeserializer {
    static deserializeSub(obj: ActionSerialized): Action {
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
                action.addPoint(point);
            return action;
        }
        if (obj.type == "fill") {
            return new ActionFill(obj.userid, obj.points, obj.color);
        }
        if (obj.type == "freedrawinteractivegraph") {
            const action = new ActionFreeDraw(obj.userid);
            for (const point of obj.points)
                action.addPoint(point);

            action.setInteractiveGraphInformation(obj.magnet1id, obj.magnet2id, obj.magnet1point, obj.magnet2point);
            return action;
        }
        if (obj.type == "erase") {
            const action = new ActionErase(obj.userid);
            for (const point of obj.points)
                action.addPoint(point)
            return action;
        }
        if (obj.type == "clearzone") {
            return new ActionClearZone(obj.userid, obj.points);
        }
        if (obj.type == "clear") {
            return new ActionClear(obj.userid);
        }
        if (obj.type == "printmagnet") {
            return new ActionPrintMagnet(obj.userid, <HTMLImageElement>HTMLdeserialize(obj.magnet), obj.x, obj.y);
        }
        if (obj.type == "magnetnew") {
            return new ActionMagnetNew(obj.userid, <HTMLImageElement>HTMLdeserialize(obj.magnet));
        }
        if (obj.type == "magnetmove") {
            return new ActionMagnetMove(obj.userid, obj.magnetid, obj.points);
        }
        if (obj.type == "magnetdelete") {
            return new ActionMagnetDelete(obj.userid, obj.magnetid);
        }
        if (obj.type == "magnetswitchbackgroundforeground") {
            return new ActionMagnetSwitchBackgroundForeground(obj.userid, obj.magnetid);
        }
        if (obj.type == "magnetchangesizeratio") {
            return new ActionMagnetChangeSizeRatio(obj.userid, obj.magnetid, obj.ratio);
        }
        if (obj.type == "slidestart")
            return new ActionSlideStart(obj.userid);
            
        throw "ActionDeserializer: unknown type of action";
    }

    static deserialize(obj: ActionSerialized): Action {
        return ActionDeserializer.deserializeSub(obj);
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
    return <HTMLElement>el.children[0];
}