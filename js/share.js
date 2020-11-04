const SERVERADRESS = 'ws://tableaunoir.irisa.fr:8080';


class Share {
	static ws = undefined;
	static id = undefined;
	static canWriteValueByDefault = true;
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

	}
	static init() {
		document.getElementById("shareButton").onclick = () => {
			if (!Share.isShared())
				Share.share();
		};

		document.getElementById("joinButton").onclick = () => {
			window.open(window.location, "_self")
		}

		document.getElementById("shareInEverybodyWritesMode").onclick = Share.everybodyWritesMode;
		document.getElementById("shareInTeacherMode").onclick = Share.teacherMode;

		if (window.location.origin.indexOf("github") < 0)
			document.getElementById('ShareGithub').hidden = true;

		if (Share.isSharedURL()) {
			let tryJoin = () => {
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

			}

			Share.tryConnect(tryJoin);
		}



	}


	/**
	 * @returns true iff the board is shared with others
	 */
	static isShared() {
		return Share.id != undefined;
	}


	/**
	 * @description tries to connect the server to make a shared board
	 */
	static share() {
		try {
			Share.tryConnect(() => Share.send({ type: "share" }));

			document.getElementById("shareInfo").hidden = false;
			document.getElementById("join").hidden = true;

		}
		catch (e) {
			Share.ws = undefined;
			ErrorMessage.show("Impossible to connect to the server", e);
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
				document.getElementById("shareMode").hidden = false;

				break;
			case "user": //there is an existing user
				console.log("existing user: ", msg.userid)
				if (msg.userid == UserManager.me.userID)
					throw "oops... an already existing user has the same name than me";

				UserManager.add(msg.userid);
				break;

			case "join": //a new user joins the group
				console.log("a new user is joining: ", msg.userid)
				// the leader is the user with the smallest ID

				UserManager.add(msg.userid);

				if (UserManager.isSmallestUserID()) {
					canvas.toBlob((blob) => Share.sendFullCanvas(blob, msg.userid));
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
				MagnetManager._installMagnets();
				break;
			case "newmagnet":
				console.log("new magnet:")
				document.getElementById("magnets").innerHTML =
					document.getElementById("magnets").innerHTML + (msg.data); //a bit crazy
				MagnetManager._installMagnets();
				break;
			case "execute": eval("ShareEvent." + msg.event)(...msg.params);
		}
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
	static sendFullCanvas(blob, to) {
		Share.send({ type: "fullCanvas", data: canvas.toDataURL(), to: to }); // at some point send the blob directly
	}


	static sendMagnets(to) {
		if (Share.isShared()) {
			if (to)
				Share.send({ type: "magnets", magnets: document.getElementById("magnets").innerHTML, to: to }); // send the html code for all the magnets
			else
				Share.send({ type: "magnets", magnets: document.getElementById("magnets").innerHTML }); // send the html code for all the magnets
		}

	}



	static sendNewMagnet(element) {
		console.log("new magnet sent!")
		Share.send({type: "newmagnet", data: element.outerHTML });
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
				let props = [//'target', 'clientX', 'clientY', 'layerX', 'layerY', 
					'pressure', 'offsetX', 'offsetY'];
				props.forEach(prop => {
					Object.defineProperty(obj, prop, {
						value: obj[prop],
						enumerable: true,
						configurable: true
					});
				});
			}

			return obj;
		}
		eval("ShareEvent." + event)(...params);
		if (Share.isShared())
			Share.send({ type: "execute", event: event, params: params.map((param) => adapt(param)) });
	}


	static _setTableauID(id) {
		Share.id = id;
		let newUrl = document.location.href + "?id=" + id;
		history.pushState({}, null, newUrl);
		document.getElementById("shareUrl").value = newUrl;

		//document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));

	}











	static isSharedURL() {
		let params = (new URL(document.location)).searchParams;
		return params.get('id') != null;
	}


	static getTableauNoirID() {
		if (Share.isSharedURL()) {
			return Share.getIDInSharedURL();
		}
		else
			return "local";
	}


	static getIDInSharedURL() {
		let params = (new URL(document.location)).searchParams;
		return params.get('id');
	}




	static join(id) {
		Share.send({ type: "join", id: id });
	}



	static teacherMode() {
		Share.setCanWriteForAllExceptMeAndByDefault(false);
	}


	static setCanWriteForAllExceptMeAndByDefault(bool) {
		for (let userid in UserManager.users) {
			if (UserManager.users[userid] != UserManager.me)
				Share.execute("setUserCanWrite", [userid, bool]);
		}
		Share.canWriteValueByDefault = bool;
		Share.execute("setUserCanWrite", [UserManager.me.userID, true]);
	}

	static everybodyWritesMode() {
		Share.setCanWriteForAllExceptMeAndByDefault(true);
	}
}








