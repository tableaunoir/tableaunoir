class Toolbar {
    static init() {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPad/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
            buttonCloseControls.hidden = true; //on phone or tablet, we can not remove the toolbar
        }
    }




    static toggle() {
        controls.hidden = !controls.hidden;
    }
}