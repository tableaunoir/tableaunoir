class Share {
	static ws;
	static id = undefined;

	static init() {
		Share.ws = new WebSocket('ws://tableaunoir.irisa.fr:443');
		
		Share.ws.onmessage = (msg) => {
			console.log("I received the data: ");
			console.log(msg.data)
		};

		setTimeout(() => Share.share(), 1000);
	}


	static share() {
		this.ws.send("share");
	}


	static join(id) {

	}
}


