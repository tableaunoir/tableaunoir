class Share {
	static ws;
	static id = undefined;

	static init() {
		Share.ws = new WebSocket('ws://tableaunoir.irisa.fr:443');
		Share.ws.binaryType = "arraybuffer";

		Share.ws.onopen = () => { Share.tryJoin(); };
		Share.ws.onmessage = (msg) => {
			console.log("I received the message: ");
			console.log(msg)
			Share._treatReceivedMessage(JSON.parse(msg.data));
		};

		document.getElementById("shareButton").onclick = () => {
			if (Share.isShared())
				Share.share();
		};

		setTimeout(() => Share.share(), 1000);
	}



	static isShared() {
		return Share.id != undefined;
	}

	static share() {
		Share.send({ type: "share" });
		Share.sendFullCanvas();
	}



	static _treatReceivedMessage(msg) {
		switch (msg.type) {
			case "id": Share._setID(msg.id); break;
			case "join": break; //somebody joins
			case "fullCanvas": BoardManager.load(msg.data); break;
		}
	}


	static send(msg) {
		msg.id = Share.id;
		this.ws.send(JSON.stringify(msg));
	}


	static sendFullCanvas() {
		Share.send({type: "fullCanvas", data: canvas.toDataURL()});
	}

	static _setID(id) {
		Share.id = id;
		let newUrl = document.location.href + "?id=" + id;
		history.pushState({}, null, newUrl);
	}


	static tryJoin() {
		let params = (new URL(document.location)).searchParams;
		id = params.get('id');
		Share.join(id);
	}


	static join(id) {
		Share.send({ type: "join", id: id });
	}
}








