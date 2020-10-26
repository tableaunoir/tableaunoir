class Share {
	static ws = undefined;
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
			if (!Share.isShared())
				Share.share();
		};

		setTimeout(() => {
			if (!Share.isShared())
				Share.share()
		}, 1000); //just for test. Should be removed at the end (the button share does it)
	}



	static isShared() {
		console.log("already shared! the id is " + Share.id);
		return Share.id != undefined;
	}

	static share() {
		Share.send({ type: "share" });
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


	static sendFullCanvas(blob) {
		Share.send({ type: "fullCanvas", data: canvas.toDataURL() }); // at some point send the blob directly
	}

	static _setID(id) {
		Share.id = id;
		let newUrl = document.location.href + "?id=" + id;
		history.pushState({}, null, newUrl);

		document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));

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








