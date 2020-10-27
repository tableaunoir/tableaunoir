const { stringify } = require("querystring");

class Share {
	static ws = undefined;
	static id = undefined;

	static init() {
		try {
			Share.ws = new WebSocket('ws://tableaunoir.irisa.fr:443');
			Share.ws.binaryType = "arraybuffer";

			Share.ws.onopen = () => { Share.tryJoin(); };
			Share.ws.onmessage = (msg) => {
				console.log("I received the message: ");
				console.log(msg)
				Share._treatReceivedMessage(JSON.parse(msg.data));
			};

			document.getElementById("shareButton").onclick = () => {
				if (!Share.isShared())
					Share.share();
			};

			setTimeout(() => {
				if (!Share.isShared()) {
					console.log("already shared! the id is " + Share.id);
					Share.share()
				}

			}, 1000); //just for test. Should be removed at the end (the button share does it)
		}
		catch (e) {

		}

	}



	static isShared() {
		return Share.id != undefined;
	}

	static share() {
		Share.send({ type: "share" });
	}



	static _treatReceivedMessage(msg) {
		switch (msg.type) {
			case "id": Share._setID(msg.id); break;
			case "userid": Share._setMyUserID(msg.userid); break;
			case "join": users[msg.userid] = new User(); break;
			case "leave": delete users[msg.userid]; break;
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
		function stringify(obj) {
			if (obj instanceof MouseEvent) {
				let props = ['target', 'clientX', 'clientY', 'layerX', 'layerY'];
				props.forEach(prop => {
					Object.defineProperty(obj, prop, {
						value: obj[prop],
						enumerable: true,
						configurable: true
					});
				});
			}

			console.log(JSON.stringify(obj));
			return JSON.stringify(obj);
		}
		eval("ShareEvent." + event)(...params);
		if (Share.isShared())
			Share.send({ type: "execute", event: event, params: params.map((param) => stringify(param)) };
	}


	static _setID(id) {
		Share.id = id;
		let newUrl = document.location.href + "?id=" + id;
		history.pushState({}, null, newUrl);

		document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));

	}


	static _setMyUserID(userid) {
		users = {};

		for (let key in users) {
			if (users[key] == user)
				delete users[key];
		}

		users[userid] = user;
		user.setUserID(userid);
	}


	static tryJoin() {
		let params = (new URL(document.location)).searchParams;
		Share.id = params.get('id');
		if (Share.id != null)
			Share.join(Share.id);
	}


	static join(id) {
		Share.send({ type: "join", id: id });
	}
}








