class Share {
	static ws;

	static init() {
		Share.ws = new WebSocket('ws://tableaunoir.irisa.fr:8080');
		
		Share.ws.onmessage = (msg) => {
			console.log("I received ");
			console.log(msg)
		};
		
		setTimeout(() => Share.share(), 1000);
	}


	static share() {
		this.ws.send("share");
	}
}


