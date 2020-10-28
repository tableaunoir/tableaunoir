
class Share {
	static ws = undefined;
	static id = undefined;

	/**
	 * 
	 * @param {*} a function f 
	 * @description tries to connect to the server, when the connection is made, it executes f
	 */
	static tryConnect(f) {
		if (Share.ws != undefined)
			return;

		Share.ws = new WebSocket('ws://tableaunoir.irisa.fr:8080');
		Share.ws.binaryType = "arraybuffer";



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



	static _treatReceivedMessage(msg) {
		if (msg.type != "fullCanvas" && msg.type != "execute")
			console.log("Server -> me: " + JSON.stringify(msg));
		else
			console.log("Server -> me: " + msg.type);
		switch (msg.type) {
			case "id": Share._setTableauID(msg.id); break;
			case "userid":
				Share._setMyUserID(msg.userid);

				document.getElementById("shareAndJoin").hidden = true;
				document.getElementById("shareInfo").hidden = false;
				break;
			case "join": users[msg.userid] = new User(); console.log(users); Share.updateUsers(); break;
			case "leave": users[msg.userid].destroy(); delete users[msg.userid]; Share.updateUsers(); break;
			case "fullCanvas": BoardManager.loadWithoutSave(msg.data); break;
			case "execute": eval("ShareEvent." + msg.event)(...msg.params);
		}
	}


	static send(msg) {
		msg.id = Share.id;
		this.ws.send(JSON.stringify(msg));
	}


	static sendFullCanvas(blob) {
		Share.send({ type: "fullCanvas", data: canvas.toDataURL() }); // at some point send the blob directly
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

		document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));

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

	static getIDInSharedURL() {
		let params = (new URL(document.location)).searchParams;
		return params.get('id');
	}




	static join(id) {
		Share.send({ type: "join", id: id });
	}
}








