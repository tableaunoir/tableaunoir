/**
 * This class makes that the mouse event also works for touch screens.
 **/
class TouchScreen {

    /**
     * 
     * @param {*} element 
     * @description makes that an element with events for the mouse, can be used on a smartphone/tablet
     */
    static addTouchEvents(element) {
        element.ontouchstart = TouchScreen._touchHandler;
        element.ontouchmove = TouchScreen._touchHandler;
        element.ontouchend = TouchScreen._touchHandler;
        element.ontouchcancel = TouchScreen._touchHandler;
    }
    /**
     * 
     * @param {*} event 
     * @description converts a touch event into a mouse event
     */
    static _touchHandler(event) {
        var touches = event.changedTouches,
            first = touches[0],
            type = "";
        switch (event.type) {
            case "touchstart": type = "mousedown"; break;
            case "touchmove": type = "mousemove"; break;
            case "touchend": type = "mouseup"; break;
            default: return;
        }

        // initMouseEvent(type, canBubble, cancelable, view, clickCount, 
        //                screenX, screenY, clientX, clientY, ctrlKey, 
        //                altKey, shiftKey, metaKey, button, relatedTarget);

        var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent(type, true, true, window, 1,
            first.screenX, first.screenY,
            first.clientX, first.clientY, false,
            false, false, false, 0/*left*/, null);

        first.target.dispatchEvent(simulatedEvent);
        event.preventDefault();
    }
}