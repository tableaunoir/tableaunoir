class Share {
	static ws;
	static id = undefined;

	static init() {
		Share.ws = new WebSocket('ws://tableaunoir.irisa.fr:443');

		Share.ws.onmessage = (msg) => {
			console.log("I received the data: ");
			console.log(msg.data)
			Share._treatReceivedMessage(JSON.parse(msg.data));
		};

		setTimeout(() => Share.share(), 1000);
	}


	static share() {
		Share.send({ type: "share" });
	}



	static _treatReceivedMessage(msg) {
		switch (msg.type) {
			case "id": Share._setID(msg.id); break;
		}
	}


	static send(msg) {
		this.ws.send(JSON.stringify(msg));
	}

	static _setID(id) {
		Share.id = id;
		let newUrl = document.location.href + "?id=" + id;
		history.pushState({}, null, newUrl);
	}


	static join(id) {
		Share.send({ type: "join", id: id });
	}
}








