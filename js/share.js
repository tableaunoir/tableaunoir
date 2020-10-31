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



	static isShared() {
		return Share.id != undefined;
	}

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
	 * @returns true if the userID of the current user is the minimum of all participants
	 */
	static isSmallestUserID() {
		let minkey = "zzzzzzzzzzzzzzzz";
		for (let key in users) {
			if (key < minkey)
				minkey = key;
		}
		return (user.userID == minkey);
	}

	static _treatReceivedMessage(msg) {
		if (msg.type != "fullCanvas" && msg.type != "execute")
			console.log("Server -> me: " + JSON.stringify(msg));
		else
			console.log("Server -> me: " + msg.type);
		switch (msg.type) {
			case "id": Share._setTableauID(msg.id); break;
			case "youruserid": // "your name is ..."
				Share._setMyUserID(msg.userid);

				document.getElementById("shareAndJoin").hidden = true;
				document.getElementById("shareInfo").hidden = false;
				document.getElementById("shareMode").hidden = false;

				break;
			case "user": //there is an existing user
				if (userid != user.userID)
					users[userid] = new User();
				Share.updateUsers();
				break;

			case "join": //a new user joins the group

				// the leader is the user with the smallest ID
				if (Share.isSmallestUserID()) {
					canvas.toBlob((blob) => Share.sendFullCanvas(blob, msg.userid));
					Share.execute("setUserCanWrite", [msg.userid, Share.canWriteValueByDefault]);
				}
				users[msg.userid] = new User();
				Share.updateUsers();



				break;
			case "leave": users[msg.userid].destroy(); delete users[msg.userid]; Share.updateUsers(); break;
			case "fullCanvas": BoardManager.loadWithoutSave(msg.data); break;
			case "execute": eval("ShareEvent." + msg.event)(...msg.params);
		}
	}


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


	static _setMyUserID(userid) {
		for (let key in users) {
			if (users[key] == user)
				delete users[key];
		}

		users[userid] = user;
		user.setUserID(userid);
		Share.updateUsers();
	}




	static updateUsers() {
		let i = 0;
		let keys = [];
		for (var key in users) {
			i++;
			keys.push(key);
		}
		document.getElementById("users").innerHTML = i + " users: " + keys.join("   ");
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
		for (let userid in users) {
			if (users[userid] != user)
				Share.execute("setUserCanWrite", [userid, bool]);
		}
		Share.canWriteValueByDefault = bool;
		Share.execute("setUserCanWrite", [user.userID, true]);
	}

	static everybodyWritesMode() {
		Share.setCanWriteForAllExceptMeAndByDefault(true);
	}
}








