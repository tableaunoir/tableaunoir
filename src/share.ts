const SERVERADRESS = 'ws://tableaunoir.irisa.fr:8080';
const DEFAULTADRESS = "http://tableaunoir.irisa.fr";



/**
 * the class that enables to share the board
 */
class Share {
	static ws: WebSocket = undefined;
	static id: string = undefined;
	static canWriteValueByDefault: boolean = true;

	/**
	 * 
	 * @param {*} a function f 
	 * @description tries to connect to the server, when the connection is made, it executes f
	 */
	static tryConnect(f) {
		if (Share.ws != undefined)
			return;

		Share.ws = new WebSocket(SERVERADRESS);
		Share.ws.binaryType = "arraybuffer";

		Share.ws.onerror = () => { ErrorMessage.show("Impossible to connect to the server.") };

		Share.ws.onopen = f;
		Share.ws.onmessage = (msg) => {
			console.log("I received the message: ");
			Share._treatReceivedMessage(JSON.parse(msg.data));
		};

		document.getElementById("buttonAskQuestion").hidden = false;

	}


	/**
	 * @returns true iff we are on github.io
	 */
	static isOnGitHub() {
		return window.location.origin.indexOf("github") >= 0;
	}
	/**
	 * initialization
	 */
	static init() {
		document.getElementById("shareButton").onclick = () => {
			if (!Share.isShared())
				Share.share();
		};

		document.getElementById("buttonShare").onclick = function () {
			if (!Share.isShared()) {
				Share.share();
			} else {
				Share.copyShareUrl();
			}
		}

		document.getElementById("joinButton").onclick = () => {
			window.open(<any>window.location, "_self")
		}

		const checkboxSharePermissionWrite = <HTMLInputElement>document.getElementById("sharePermissionWrite");
		checkboxSharePermissionWrite.onclick =
			() => Share.setCanWriteForAllExceptMeAndByDefault(checkboxSharePermissionWrite.checked);

		if (!Share.isOnGitHub())
			document.getElementById('ShareGithub').hidden = true;

		if (Share.isSharedURL()) {
			let tryJoin = () => {
				try {
					Share.id = Share.getIDInSharedURL();
					if (Share.id != null) {
						Share.join(Share.id);
						(<HTMLInputElement>document.getElementById("shareUrl")).value = <any>document.location;
					}
				}
				catch (e) {
					Share.ws = undefined;
					Share.showConnectionError();
				}

			}

			Share.tryConnect(tryJoin);
		}

		document.getElementById("buttonAskPrivilege").onclick = Share.askPrivilege;

		document.getElementById("buttonCopyShareUrl").onclick = Share.copyShareUrl;
	}




	/**
	 * @description ask for privilege (root)
	 */
	static askPrivilege() {
		const passwordCandidate = (<HTMLInputElement>document.getElementById("passwordCandidate")).value;
		Share.send({ type: "askprivilege", password: passwordCandidate })
	}


	static copyShareUrl() {
		const sharelink = (<HTMLInputElement>document.getElementById("shareUrl")).value;
		navigator.clipboard.writeText(sharelink).
			then(function () { document.getElementById("shareUrlCopied").hidden = false; },
        /* else */ function () { document.getElementById("shareUrlCopied").hidden = false; });
	};


	/**
	 * @returns true iff the board is shared with others
	 */
	static isShared() {
		return Share.id != undefined;
	}


	static showConnectionError() {
		if (Share.isOnGitHub())
			ErrorMessage.show("For sharing, first go to a deployed server. Go to menu/share for more information.");
		else
			ErrorMessage.show("Impossible to connect to the server");
	}
	/**
	 * @returns true iff the current user is root
	 */
	static isRoot() {
		return document.getElementById("askPrivilege").hidden;
	}

	/**
	 * @description tries to connect the server to make a shared board
	 */
	static share() {
		try {
			const password = (<HTMLInputElement>document.getElementById("password")).value;

			Share.tryConnect(() => Share.send({ type: "share", password: password }));

			document.getElementById("shareInfo").hidden = false;
			document.getElementById("buttonShare").innerHTML = document.getElementById('sharecopytext').innerHTML;
			document.getElementById("join").hidden = true;

			if (password == "") {
				Share.setCanWriteForAllExceptMeAndByDefault(true);
			}
			else
				Share.setCanWriteForAllExceptMeAndByDefault(false);

			Share.setRoot();

		}
		catch (e) {
			Share.ws = undefined;
			Share.showConnectionError();
		}

	}




	/**
	 * 
	 * @param {*} msg as an object
	 * @description treats the msg received from the server
	 */
	static _treatReceivedMessage(msg) {
		if (msg.type != "fullCanvas" && msg.type != "magnets" && msg.type != "execute")
			console.log("Server -> me: " + JSON.stringify(msg));
		else
			console.log("Server -> me: " + msg.type);
		switch (msg.type) {
			case "id": Share._setTableauID(msg.id); break;
			case "youruserid": // "your name is ..."
				UserManager.setMyUserID(msg.userid);

				document.getElementById("shareAndJoin").hidden = true;
				document.getElementById("shareInfo").hidden = false;

				document.getElementById("buttonShare").innerHTML = document.getElementById('sharecopytext').innerHTML;

				break;
			case "user": //there is an existing user
				console.log("existing user: ", msg.userid)
				if (msg.userid == UserManager.me.userID)
					throw "oops... an already existing user has the same name than me";

				UserManager.add(msg.userid);
				break;
			case "root": //you obtained root permission and the server tells you that
				console.log("I am root.")
				Share.setRoot();
				break;
			case "accessdenied":
				ErrorMessage.show("Access denied");
				break;
			case "join": //a new user joins the group
				console.log("a new user is joining: ", msg.userid)
				// the leader is the user with the smallest ID

				UserManager.add(msg.userid);

				if (UserManager.isSmallestUserID()) {
					getCanvas().toBlob((blob) => Share.sendFullCanvas(blob, msg.userid));
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
				console.log(msg.magnets)
				document.getElementById("magnets").innerHTML = msg.magnets;
				MagnetManager.installMagnets();
				break;
			case "magnetChanged":
				document.getElementById(msg.magnetid).outerHTML = msg.data;
				MagnetManager.installMagnets();
				break;
			case "newmagnet":
				console.log("new magnet:")
				document.getElementById("magnets").innerHTML =
					document.getElementById("magnets").innerHTML + (msg.data); //a bit crazy
				MagnetManager.installMagnets();
				break;
			case "execute": eval("ShareEvent." + msg.event)(...msg.params);
		}
	}


	/**
	 * modify the interface to say that the current user is root (all privileges)
	 */
	static setRoot() {
		document.getElementById("askPrivilege").hidden = true;
		document.getElementById("shareMode").hidden = false;
	}

	/**
	 * 
	 * @param {*} msg as an object
	 * @description send the message to server
	 * 
	 */
	static send(msg) {
		msg.id = Share.id;
		this.ws.send(JSON.stringify(msg));
	}

	/**
	 * 
	 * @param {*} blob 
	 * @param {*} to 
	 * @description send the blob of the canvas to the user to
	 */
	static sendFullCanvas(blob, to?) {
		Share.send({ type: "fullCanvas", data: getCanvas().toDataURL(), to: to }); // at some point send the blob directly
	}


	/**
	 * 
	 * @param to 
	 * @description send all the magnets to to. If to is undefined, send to all.
	 */
	static sendMagnets(to?) {
		if (Share.isShared()) {
			if (to)
				Share.send({ type: "magnets", magnets: document.getElementById("magnets").innerHTML, to: to }); // send the html code for all the magnets
			else
				Share.send({ type: "magnets", magnets: document.getElementById("magnets").innerHTML }); // send the html code for all the magnets
		}

	}

	/**
	 * 
	 * @param element 
	 * @description send the fact that there is a new magnet
	 */
	static sendNewMagnet(element) {
		console.log("new magnet sent!")
		Share.send({ type: "newmagnet", data: element.outerHTML });
	}


	/**
	 * 
	 * @param element 
	 * @description send the new information about an existing magnet
	 */
	static sendMagnetChanged(element) {
		Share.send({ type: "magnetChanged", magnetid: element.id, data: element.outerHTML });
	}


	/**
	 * 
	 * @param {*} event, an event name (string), that is a method of the class ShareEvent
	 * @param {*} params an array of parameters
	 * @description executes the event with the params, that is execute the method event of the class ShareEvent
	 * with the params. Then send a message to server that this event should be executed for the other users as well
	 */
	static execute(event, params) {
		function adapt(obj) {
			if (obj instanceof MouseEvent) {
				return { pressure: (<any>obj).pressure, offsetX: obj.offsetX, offsetY: obj.offsetY };
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
		eval("ShareEvent." + event)(...params);
		if (Share.isShared())
			Share.send({ type: "execute", event: event, params: params.map((param) => adapt(param)) });
	}


	/**
	 * 
	 * @param id 
	 * @description set the ID of the current board
	 */
	static _setTableauID(id) {
		Share.id = id;

		const url = document.location.href;
		/*	if (url.startsWith("file://"))
				url = DEFAULTADRESS;*/

		const newUrl = url + "?id=" + id;
		history.pushState({}, null, newUrl);

		(<HTMLInputElement>document.getElementById("shareUrl")).value = url.startsWith("file://") ? DEFAULTADRESS + "?id=" + id : newUrl;

		//document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));

	}










	/**
	 * @returns yes if the current URL is an URL of a shared board
	 */
	static isSharedURL() {
		let params = (new URL(<any>document.location)).searchParams;
		return params.get('id') != null;
	}


	/**
	 * @returns the current tableaunoir ID
	 */
	static getTableauNoirID() {
		if (Share.isSharedURL()) {
			return Share.getIDInSharedURL();
		}
		else
			return "local";
	}

	/**
	 * @returns the current tableaunoir ID
	 */
	static getIDInSharedURL() {
		let params = (new URL(<any>document.location)).searchParams;
		return params.get('id');
	}



	/**
	 * 
	 * @param id 
	 * @description say that the current user wants to join the tableaunoir id
	 */
	static join(id) {
		Share.send({ type: "join", id: id });
	}


	/**
	 * 
	 * @param canWrite 
	 * @description if canWrite == true, makes that everybody can draw, otherwise only you can
	 */
	static setCanWriteForAllExceptMeAndByDefault(canWrite) {
		document.getElementById("imgWritePermission" + canWrite).hidden = false;
		document.getElementById("imgWritePermission" + !canWrite).hidden = true;

		(<HTMLInputElement>document.getElementById("sharePermissionWrite")).checked = canWrite;

		for (let userid in UserManager.users) {
			if (UserManager.users[userid] != UserManager.me)
				Share.execute("setUserCanWrite", [userid, canWrite]);
		}
		Share.canWriteValueByDefault = canWrite;
		Share.execute("setUserCanWrite", [UserManager.me.userID, true]);
	}


}








