var SERVERADRESS = 'ws://tableaunoir.irisa.fr:8080';
var DEFAULTADRESS = "http://tableaunoir.irisa.fr";
var Share = /** @class */ (function () {
    function Share() {
    }
    /**
     *
     * @param {*} a function f
     * @description tries to connect to the server, when the connection is made, it executes f
     */
    Share.tryConnect = function (f) {
        if (Share.ws != undefined)
            return;
        Share.ws = new WebSocket(SERVERADRESS);
        Share.ws.binaryType = "arraybuffer";
        Share.ws.onerror = function () { ErrorMessage.show("Impossible to connect to the server."); };
        Share.ws.onopen = f;
        Share.ws.onmessage = function (msg) {
            console.log("I received the message: ");
            Share._treatReceivedMessage(JSON.parse(msg.data));
        };
    };
    Share.init = function () {
        document.getElementById("shareButton").onclick = function () {
            if (!Share.isShared())
                Share.share();
        };
        document.getElementById("joinButton").onclick = function () {
            window.open(window.location, "_self");
        };
        document.getElementById("shareInEverybodyWritesMode").onclick = Share.everybodyWritesMode;
        document.getElementById("shareInTeacherMode").onclick = Share.teacherMode;
        if (window.location.origin.indexOf("github") < 0)
            document.getElementById('ShareGithub').hidden = true;
        if (Share.isSharedURL()) {
            var tryJoin = function () {
                try {
                    Share.id = Share.getIDInSharedURL();
                    if (Share.id != null) {
                        Share.join(Share.id);
                        document.getElementById("shareUrl").value = document.location;
                    }
                }
                catch (e) {
                    Share.ws = undefined;
                    ErrorMessage.show("Impossible to connect to the server", e);
                }
            };
            Share.tryConnect(tryJoin);
        }
    };
    /**
     * @returns true iff the board is shared with others
     */
    Share.isShared = function () {
        return Share.id != undefined;
    };
    /**
     * @description tries to connect the server to make a shared board
     */
    Share.share = function () {
        try {
            Share.tryConnect(function () { return Share.send({ type: "share" }); });
            document.getElementById("shareInfo").hidden = false;
            document.getElementById("join").hidden = true;
        }
        catch (e) {
            Share.ws = undefined;
            ErrorMessage.show("Impossible to connect to the server", e);
        }
    };
    /**
     *
     * @param {*} msg as an object
     * @description treats the msg received from the server
     */
    Share._treatReceivedMessage = function (msg) {
        if (msg.type != "fullCanvas" && msg.type != "magnets" && msg.type != "execute")
            console.log("Server -> me: " + JSON.stringify(msg));
        else
            console.log("Server -> me: " + msg.type);
        switch (msg.type) {
            case "id":
                Share._setTableauID(msg.id);
                break;
            case "youruserid": // "your name is ..."
                UserManager.setMyUserID(msg.userid);
                document.getElementById("shareAndJoin").hidden = true;
                document.getElementById("shareInfo").hidden = false;
                document.getElementById("shareMode").hidden = false;
                break;
            case "user": //there is an existing user
                console.log("existing user: ", msg.userid);
                if (msg.userid == UserManager.me.userID)
                    throw "oops... an already existing user has the same name than me";
                UserManager.add(msg.userid);
                break;
            case "join": //a new user joins the group
                console.log("a new user is joining: ", msg.userid);
                // the leader is the user with the smallest ID
                UserManager.add(msg.userid);
                if (UserManager.isSmallestUserID()) {
                    getCanvas().toBlob(function (blob) { return Share.sendFullCanvas(blob, msg.userid); });
                    Share.sendFullCanvas(msg.userid);
                    Share.sendMagnets(msg.userid);
                    Share.execute("setUserCanWrite", [msg.userid, Share.canWriteValueByDefault]);
                }
                break;
            case "leave":
                UserManager.leave(msg.userid);
                break;
            case "fullCanvas":
                BoardManager.loadWithoutSave(msg.data);
                break;
            case "magnets":
                console.log(msg.magnets);
                document.getElementById("magnets").innerHTML = msg.magnets;
                MagnetManager.installMagnets();
                break;
            case "magnetChanged":
                document.getElementById(msg.magnetid).outerHTML = msg.data;
                MagnetManager.installMagnets();
                break;
            case "newmagnet":
                console.log("new magnet:");
                document.getElementById("magnets").innerHTML =
                    document.getElementById("magnets").innerHTML + (msg.data); //a bit crazy
                MagnetManager.installMagnets();
                break;
            case "execute": eval("ShareEvent." + msg.event).apply(void 0, msg.params);
        }
    };
    /**
     *
     * @param {*} msg as an object
     * @description send the message to server
     *
     */
    Share.send = function (msg) {
        msg.id = Share.id;
        this.ws.send(JSON.stringify(msg));
    };
    /**
     *
     * @param {*} blob
     * @param {*} to
     * @description send the blob of the canvas to the user to
     */
    Share.sendFullCanvas = function (blob, to) {
        Share.send({ type: "fullCanvas", data: getCanvas().toDataURL(), to: to }); // at some point send the blob directly
    };
    Share.sendMagnets = function (to) {
        if (Share.isShared()) {
            if (to)
                Share.send({ type: "magnets", magnets: document.getElementById("magnets").innerHTML, to: to }); // send the html code for all the magnets
            else
                Share.send({ type: "magnets", magnets: document.getElementById("magnets").innerHTML }); // send the html code for all the magnets
        }
    };
    Share.sendNewMagnet = function (element) {
        console.log("new magnet sent!");
        Share.send({ type: "newmagnet", data: element.outerHTML });
    };
    Share.sendMagnetChanged = function (element) {
        Share.send({ type: "magnetChanged", magnetid: element.id, data: element.outerHTML });
    };
    /**
     *
     * @param {*} event, an event name (string), that is a method of the class ShareEvent
     * @param {*} params an array of parameters
     * @description executes the event with the params, that is execute the method event of the class ShareEvent
     * with the params. Then send a message to server that this event should be executed for the other users as well
     */
    Share.execute = function (event, params) {
        function adapt(obj) {
            if (obj instanceof MouseEvent) {
                return { pressure: obj.pressure, offsetX: obj.offsetX, offsetY: obj.offsetY };
            }
            else
                return obj;
            /*	let props = [//'target', 'clientX', 'clientY', 'layerX', 'layerY',
                    'pressure', 'offsetX', 'offsetY'];
                props.forEach(prop => {
                    Object.defineProperty(obj, prop, {
                        value: obj[prop],
                        enumerable: true,
                        configurable: true
                    });
                });
            }

            return obj;*/
        }
        eval("ShareEvent." + event).apply(void 0, params);
        if (Share.isShared())
            Share.send({ type: "execute", event: event, params: params.map(function (param) { return adapt(param); }) });
    };
    Share._setTableauID = function (id) {
        Share.id = id;
        var url = document.location.href;
        if (url.startsWith("file://"))
            url = DEFAULTADRESS;
        var newUrl = url + "?id=" + id;
        history.pushState({}, null, newUrl);
        document.getElementById("shareUrl").value = newUrl;
        //document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));
    };
    Share.isSharedURL = function () {
        var params = (new URL(document.location)).searchParams;
        return params.get('id') != null;
    };
    Share.getTableauNoirID = function () {
        if (Share.isSharedURL()) {
            return Share.getIDInSharedURL();
        }
        else
            return "local";
    };
    Share.getIDInSharedURL = function () {
        var params = (new URL(document.location)).searchParams;
        return params.get('id');
    };
    Share.join = function (id) {
        Share.send({ type: "join", id: id });
    };
    Share.teacherMode = function () {
        Share.setCanWriteForAllExceptMeAndByDefault(false);
    };
    Share.setCanWriteForAllExceptMeAndByDefault = function (bool) {
        for (var userid in UserManager.users) {
            if (UserManager.users[userid] != UserManager.me)
                Share.execute("setUserCanWrite", [userid, bool]);
        }
        Share.canWriteValueByDefault = bool;
        Share.execute("setUserCanWrite", [UserManager.me.userID, true]);
    };
    Share.everybodyWritesMode = function () {
        Share.setCanWriteForAllExceptMeAndByDefault(true);
    };
    Share.ws = undefined;
    Share.id = undefined;
    Share.canWriteValueByDefault = true;
    return Share;
}());
//# sourceMappingURL=share.js.map