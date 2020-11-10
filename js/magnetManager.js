var MagnetManager = /** @class */ (function () {
    function MagnetManager() {
    }
    /**
     * initialization
     */
    MagnetManager.init = function () {
        document.getElementById("clearMagnet").onclick = MagnetManager.clearMagnet;
        document.getElementById("magnetsArrange").onclick = MagnetManager.arrange;
        document.getElementById("magnetsCreateGraph").onclick = MagnetManager.drawGraph;
    };
    /**
     * @returns the magnet under the cursor
     */
    MagnetManager.getMagnetUnderCursor = function () {
        return MagnetManager.magnetUnderCursor;
    };
    /**
     *
     * @param {boolean} b
     * @description if b == true, makes all the magnets interactable with the mouse/pointer
     *  if b == false, the magnets cannot be moved
     */
    MagnetManager.setInteractable = function (b) {
        var v = b ? "auto" : "none";
        var magnets = MagnetManager.getMagnets();
        for (var i = 0; i < magnets.length; i++)
            magnets[i].style.pointerEvents = v;
    };
    /**
     * @returns an array containing all the magnets
     */
    MagnetManager.getMagnets = function () {
        return document.getElementsByClassName("magnet");
    };
    /**
     * @returns the top Y when a set of magnets is automatically arranged
     */
    MagnetManager.getYTopWhenNewMagnets = function () {
        return 64;
    };
    /**
     * delete all the magnets
     */
    MagnetManager.clearMagnet = function () {
        MagnetManager.currentMagnet = undefined;
        MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
        MagnetManager.magnetY = MagnetManager.getYTopWhenNewMagnets();
        var magnets = MagnetManager.getMagnets();
        while (magnets.length > 0)
            magnets[0].remove();
        Share.sendMagnets();
        Menu.hide();
    };
    /**
     *
     * @param {*} element
     * @description add the DOM element element to the list of magnets
     */
    MagnetManager.addMagnet = function (element, callback) {
        if (callback === void 0) { callback = function (el) { }; }
        if (MagnetManager.magnetX > BoardManager.getCurrentScreenRectangle().x2 - 10) {
            MagnetManager.magnetX = BoardManager.getCurrentScreenRectangle().x1;
            MagnetManager.magnetY += 64;
        }
        element.id = "m" + Math.random(); //generate randomly an id
        element.style.left = MagnetManager.magnetX + "px";
        element.style.top = MagnetManager.magnetY + "px";
        MagnetManager.magnetX += 64;
        MagnetManager.currentMagnet = element;
        element.classList.add("magnet");
        document.getElementById("magnets").appendChild(element);
        var f = function () {
            if (Share.isShared())
                Share.sendNewMagnet(element);
            callback(element);
        };
        if (element.tagName == "IMG") {
            element.addEventListener("load", f);
        }
        else {
            f();
        }
        MagnetManager._installMagnet(element);
    };
    /**
     * @description put the existing magnets on the current screen
     */
    MagnetManager.arrange = function () {
        var magnets = MagnetManager.getMagnets();
        var _loop_1 = function (i) {
            var magnet = magnets[i];
            var x = undefined;
            var y = undefined;
            var magnetContains = function (m, x, y) {
                return (parseInt(m.style.left) <= x && parseInt(m.style.top) <= y &&
                    x <= parseInt(m.style.left) + parseInt(m.clientWidth) &&
                    y <= parseInt(m.style.top) + parseInt(m.clientHeight));
            };
            var dist = function () {
                var minDist = 100000;
                for (var j = 0; j < magnets.length; j++) {
                    minDist = Math.min(minDist, Math.abs(x - parseInt(magnets[j].style.left)) + Math.abs(y - parseInt(magnets[j].style.top)));
                }
                return minDist;
            };
            var contains = function () {
                for (var j = 0; j < magnets.length; j++) {
                    if (magnetContains(magnets[j], x, y) ||
                        magnetContains(magnets[j], x + magnet.clientWidth, y + magnet.clientHeight))
                        return true;
                }
                return false;
            };
            var rect = BoardManager.getCurrentScreenRectangle();
            var generatePosition = function () {
                var count = 0;
                var margin = 32;
                do {
                    x = rect.x1 + (Math.random() * Layout.getWindowWidth());
                    y = rect.y1 + (Math.random() * 3 * Layout.getWindowHeight() / 4);
                    x = Math.max(x, rect.x1 + margin);
                    y = Math.max(y, rect.y1 + margin);
                    x = Math.min(x, rect.x2 - magnet.clientWidth - margin);
                    y = Math.min(y, rect.y2 - magnet.clientHeight - margin);
                    count++;
                } while (contains() && count < 50);
            };
            var count = 0;
            var bestDist = 0;
            var bestX = undefined;
            var bestY = undefined;
            while (count < 30) {
                generatePosition();
                if (bestDist < dist()) {
                    bestX = x;
                    bestY = y;
                    bestDist = dist();
                }
                count++;
            }
            magnet.style.left = bestX;
            magnet.style.top = bestY;
        };
        for (var i = 0; i < magnets.length; i++) {
            _loop_1(i);
        }
    };
    /**
     * @returns the array of center points of existing magnets
     */
    MagnetManager.getNodes = function () {
        var magnets = MagnetManager.getMagnets();
        var nodes = [];
        for (var i = 0; i < magnets.length; i++) {
            var m = magnets[i];
            nodes.push({ x: parseInt(m.style.left) + m.clientWidth / 2, y: parseInt(m.style.top) + m.clientHeight / 2 });
        }
        console.log(nodes);
        return nodes;
    };
    /**
     * @description make a graph where the nodes are the magnets
     */
    MagnetManager.drawGraph = function () {
        MagnetManager.arrange();
        var nodes = MagnetManager.getNodes();
        var canvas = getCanvas();
        var context = canvas.getContext("2d");
        var edges = [];
        for (var i = 0; i < nodes.length; i++) {
            edges[i] = [];
            for (var j = 0; j < nodes.length; j++) {
                edges[i][j] = 0;
            }
        }
        // returns true iff the line from (a,b)->(c,d) intersects with (p,q)->(r,s)
        function intersects(a, b, c, d, p, q, r, s) {
            var det, gamma, lambda;
            det = (c - a) * (s - q) - (r - p) * (d - b);
            if (det === 0) {
                return false;
            }
            else {
                lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
                gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
                return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
            }
        }
        ;
        var isCrossing = function (i, j) {
            for (var k = 0; k < nodes.length; k++)
                for (var l = 0; l < nodes.length; l++)
                    if (edges[k][l]) {
                        if (intersects(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y, nodes[k].x, nodes[k].y, nodes[l].x, nodes[l].y))
                            return true;
                    }
            return false;
        };
        for (var i = 0; i < nodes.length; i++)
            for (var j = 0; j < nodes.length; j++) {
                if (Math.abs(nodes[i].x - nodes[j].x) + Math.abs(nodes[i].y - nodes[j].y) < 400 && !isCrossing(i, j)) {
                    edges[i][j] = 1;
                    drawLine(context, nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
                }
            }
        BoardManager.save();
    };
    /**
     * @description adds the event mousedown etc. to the magnets. Call LaTEX
     */
    MagnetManager.installMagnets = function () {
        var magnets = MagnetManager.getMagnets();
        for (var i = 0; i < magnets.length; i++)
            MagnetManager._installMagnet(magnets[i]);
        eval("MathJax.typeset();");
    };
    /**
     *
     * @param element
     * @description adds the event mousedown etc. to the magnet. Call LaTEX
     */
    MagnetManager._installMagnet = function (element) {
        if (element.classList.contains("magnetText"))
            MagnetManager.installMagnetText(element);
        makeDraggableElement(element);
        var f = function () { var LARGENUMBER = 10000; element.style.zIndex = LARGENUMBER - element.clientWidth; };
        if (element.tagName == "IMG") {
            element.addEventListener("load", f);
        }
        else {
            f();
        }
        element.onmouseenter = function () { MagnetManager.magnetUnderCursor = element; };
        element.onmouseleave = function () { MagnetManager.magnetUnderCursor = undefined; };
        function makeDraggableElement(element) {
            var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
            element.addEventListener("pointerdown", dragMouseDown);
            TouchScreen.addTouchEvents(element);
            var otherElementsToMove = [];
            var canvasCursorStore = undefined;
            var drag = true;
            function dragMouseDown(e) {
                drag = true;
                MagnetManager.currentMagnet = e.target;
                /**
                 *
                 * @param {*} el
                 * @param {*} bigel
                 * @returns true if el is inside bigel
                 */
                function inside(el, bigel) {
                    return el.offsetLeft > bigel.offsetLeft && el.offsetTop > bigel.offsetTop &&
                        el.offsetLeft + el.clientWidth < bigel.offsetLeft + bigel.clientWidth &&
                        el.offsetTop + el.clientHeight < bigel.offsetTop + bigel.clientHeight;
                }
                var canvas = getCanvas();
                canvasCursorStore = canvas.style.cursor;
                e = e || window.event;
                e.preventDefault(); //to avoid the drag/drop by the browser
                // get the mouse cursor position at startup:
                pos3 = e.clientX * Layout.getZoom();
                pos4 = e.clientY * Layout.getZoom();
                document.onpointerup = closeDragElement;
                document.onmouseup = closeDragElement;
                // call a function whenever the cursor moves:
                document.onpointermove = elementDrag;
                var magnets = MagnetManager.getMagnets();
                otherElementsToMove = [];
                //if(elmt.style.clipPath == undefined) //if not an image (otherwise bug)
                for (var i = 0; i < magnets.length; i++)
                    if (magnets[i] != element && inside(magnets[i], element)) {
                        otherElementsToMove.push(magnets[i]);
                    }
            }
            function elementDrag(e) {
                if (!drag)
                    return;
                MagnetManager.currentMagnet = e.target;
                e.target.classList.add("magnetDrag");
                var canvas = getCanvas();
                canvas.style.cursor = "none";
                e = e || window.event;
                e.preventDefault();
                // calculate the new cursor position:
                pos1 = pos3 - e.clientX * Layout.getZoom();
                pos2 = pos4 - e.clientY * Layout.getZoom();
                pos3 = e.clientX * Layout.getZoom();
                pos4 = e.clientY * Layout.getZoom();
                // set the element's new position:
                Share.execute("magnetMove", [element.id, element.offsetLeft - pos1, element.offsetTop - pos2]);
                for (var _i = 0, otherElementsToMove_1 = otherElementsToMove; _i < otherElementsToMove_1.length; _i++) {
                    var el = otherElementsToMove_1[_i];
                    Share.execute("magnetMove", [el.id, el.offsetLeft - pos1, el.offsetTop - pos2]);
                }
            }
            function closeDragElement(e) {
                if (!drag)
                    return;
                drag = false;
                console.log("close drag");
                if (e.target.classList != undefined) //it is undefined = dropped outside the screen. TODO: delete the magnets?
                    e.target.classList.remove("magnetDrag");
                getCanvas().style.cursor = canvasCursorStore;
                // stop moving when mouse button is released:
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    };
    /**
     *
     * @param filename
     * @param callback
     * @description adds a image magnet where the file is already on the server
     */
    MagnetManager.addMagnetImage = function (filename, callback) {
        if (callback === void 0) { callback = function (el) { }; }
        var img = new Image();
        img.src = "magnets/" + filename;
        img.classList.add("backgroundTransparent");
        MagnetManager.addMagnet(img, callback);
        return img;
    };
    /**
     *
     * @param element
     * @description set up the text magnet: add the mouse event, key event for editing the text magnet
     */
    MagnetManager.installMagnetText = function (element) {
        var divText = element.children[0];
        divText.onpointerdown = function (e) { e.stopPropagation(); };
        divText.onpointermove = function (e) { e.stopPropagation(); };
        divText.onpointerup = function (e) { e.stopPropagation(); };
        divText.onkeydown = function (e) {
            var setFontSize = function (size) {
                divText.style.fontSize = size + "px";
                for (var _i = 0, _a = divText.children; _i < _a.length; _i++) {
                    var o = _a[_i];
                    o.style.fontSize = size + "px";
                }
            };
            if (e.key == "Escape") {
                divText.blur();
                eval("MathJax.typeset();");
                window.getSelection().removeAllRanges();
                /*if(divText.innerHTML == "")
                    MagnetManager.remove(div);*/
            }
            if ((e.ctrlKey && e.key == "=") || (e.ctrlKey && e.key == "+")) { // Ctrl + +
                var size = parseInt(divText.style.fontSize);
                size++;
                setFontSize(size);
                e.preventDefault();
            }
            else if (e.ctrlKey && e.key == "-") { // Ctrl + -
                var size = parseInt(divText.style.fontSize);
                if (size > 6)
                    size--;
                setFontSize(size);
                e.preventDefault();
            }
            e.stopPropagation();
        };
        divText.onkeyup = function (evt) {
            if (Share.isShared())
                Share.sendMagnetChanged(element);
            evt.stopPropagation();
        };
    };
    /**
     *
     * @param {*} x
     * @param {*} y
     * @description adds a new magnet text at position x and y
     */
    MagnetManager.addMagnetText = function (x, y) {
        var div = document.createElement("div");
        var divText = document.createElement("div");
        div.appendChild(divText);
        divText.innerHTML = "type text";
        divText.contentEditable = "true";
        divText.style.fontSize = "24px";
        div.classList.add("magnetText");
        MagnetManager.addMagnet(div);
        div.style.left = x + "px";
        div.style.top = y + "px";
        divText.focus();
        if (Share.isShared())
            Share.sendMagnetChanged(div);
        document.execCommand('selectAll', false, null);
    };
    /**
     * @description remove the current magnet
     */
    MagnetManager.removeCurrentMagnet = function () {
        if (MagnetManager.currentMagnet == undefined)
            return;
        Share.execute("magnetRemove", [MagnetManager.currentMagnet.id]);
    };
    /**
     *
     * @param {*} id
     * @description remove the magnet of id
     */
    MagnetManager.magnetRemove = function (id) {
        document.getElementById(id).remove();
        MagnetManager.currentMagnet == undefined;
        MagnetManager.magnetUnderCursor = undefined;
    };
    /**
     * @description draw the current magnet to the canvas
     */
    MagnetManager.printCurrentMagnet = function () {
        var img = MagnetManager.currentMagnet;
        if (!(img instanceof Image)) {
            console.log("the current image is not an image! Could not be printed!");
            return;
        }
        var context = getCanvas().getContext("2d");
        var x = parseInt(img.style.left);
        var y = parseInt(img.style.top);
        var s = img.style.clipPath;
        s = s.substr("polygon(".length, s.length - "polygon(".length - ")".length);
        context.globalCompositeOperation = "source-over";
        context.save();
        context.beginPath();
        var begin = true;
        for (var _i = 0, _a = s.split(","); _i < _a.length; _i++) {
            var pointStr = _a[_i];
            pointStr = pointStr.trim();
            var a = pointStr.split(" ");
            if (begin)
                context.moveTo(x + parseInt(a[0]), y + parseInt(a[1]));
            else
                context.lineTo(x + parseInt(a[0]), y + parseInt(a[1]));
            begin = false;
        }
        context.closePath();
        context.clip();
        context.drawImage(img, x, y);
        context.restore();
        BoardManager.save();
    };
    /**
     *
     * @param magnetSetName
     * @description register a set of magnets. Add it to the magnet menu.
     */
    MagnetManager.register = function (magnetSetName) {
        document.getElementById(magnetSetName).onclick = eval(magnetSetName);
    };
    MagnetManager.magnetX = 0;
    MagnetManager.magnetY = 64;
    MagnetManager.currentMagnet = undefined; // last magnet used
    MagnetManager.magnetUnderCursor = undefined;
    return MagnetManager;
}());
//# sourceMappingURL=magnetManager.js.map