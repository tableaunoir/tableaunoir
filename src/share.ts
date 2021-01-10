import { ShareMessage, Parameter } from './ShareMessage';
import { Background } from './Background';
import { Loading } from './Loading';
import { getCanvas } from './main';
import { MagnetManager } from './magnetManager';
import { BoardManager } from './boardManager';
import { UserManager } from './UserManager';
import { ErrorMessage } from './ErrorMessage';
import { ShareEvent } from './ShareEvent';
import config from './config.json'
import { ConstraintDrawing } from './ConstraintDrawing';

/**
 * the class that enables to share the board
 */
export class Share {
	static ws: WebSocket = undefined;
	static id: string = undefined;
	static canWriteValueByDefault = true;

	/**
	 *
	 * @param {*} a function f
	 * @description tries to connect to the server, when the connection is made, it executes f
	 */
	static tryConnect(f: () => void): void {
		if (Share.ws != undefined)
			return;

		Share.ws = new WebSocket(config.server.websocket);
		Share.ws.binaryType = "arraybuffer";

		Share.ws.onerror = () => { ErrorMessage.show("Impossible to connect to the server.") };

		Share.ws.onopen = f;
		Share.ws.onmessage = (msg) => {
			//	console.log("I received the message: ");
			Share._treatReceivedMessage(JSON.parse(msg.data));
		};



	}


	/**
	 * @returns true iff we are on github.io
	 */
	static isOnGitHub(): boolean {
		return window.location.origin.indexOf("github") >= 0;
	}
	/**
	 * initialization
	 */
	static init(): void {
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
			window.open(window.location.href, "_self")
		}

		const checkboxSharePermissionWrite = <HTMLInputElement>document.getElementById("sharePermissionWrite");
		checkboxSharePermissionWrite.onclick =
			() => Share.setCanWriteForAllExceptMeAndByDefault(checkboxSharePermissionWrite.checked);

		if (!Share.isOnGitHub())
			document.getElementById('ShareGithub').hidden = true;

		if (Share.isSharedURL()) {
			const tryJoin = () => {
				try {
					Share.id = Share.getIDInSharedURL();
					if (Share.id != null) {
						Share.join(Share.id);
						(<HTMLInputElement>document.getElementById("shareUrl")).value = document.location.href;
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
	static askPrivilege(): void {
		const passwordCandidate = (<HTMLInputElement>document.getElementById("passwordCandidate")).value;
		Share.send({ type: "askprivilege", password: passwordCandidate })
	}

	/**
	 * @description copy the link to the clipboard
	 */
	static copyShareUrl(): void {
		const sharelink = (<HTMLInputElement>document.getElementById("shareUrl")).value;

		navigator.clipboard.writeText(sharelink).
			then(() => { document.getElementById("shareUrlCopied").hidden = false; },
        /* else */() => { document.getElementById("shareUrlCopied").hidden = false; });
	}


	/**
	 * @returns true iff the board is shared with others
	 */
	static isShared(): boolean {
		return Share.id != undefined;
	}


	static showConnectionError(): void {
		if (Share.isOnGitHub())
			ErrorMessage.show("For sharing, first go to a deployed server. Go to menu/share for more information.");
		else
			ErrorMessage.show("Impossible to connect to the server");
	}
	/**
	 * @returns true iff the current user is root
	 */
	static isRoot(): boolean {
		return document.getElementById("askPrivilege").hidden;
	}

	/**
	 * @description tries to connect the server to make a shared board
	 */
	static share(): void {
		try {
			const password = (<HTMLInputElement>document.getElementById("password")).value;

			Share.tryConnect(() => Share.send({ type: "share", password: password }));

			document.getElementById("shareInfo").hidden = false;
			document.getElementById("buttonShare").classList.add("alreadyShared");
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
	static _treatReceivedMessage(msg: ShareMessage): void {
		/*if (msg.type != "fullCanvas" && msg.type != "magnets" && msg.type != "execute")
			console.log("Server -> me: " + JSON.stringify(msg));
		else
			console.log("Server -> me: " + msg.type);*/
		switch (msg.type) {
			case "id": Share._setTableauID(msg.id); break;
			case "youruserid": // "your name is ..."
				UserManager.setMyUserID(msg.userid);

				document.getElementById("shareAndJoin").hidden = true;
				document.getElementById("shareInfo").hidden = false;

				document.getElementById("buttonShare").classList.add("alreadyShared");

				break;
			case "user": //there is an existing user
				console.log("existing user: ", msg.userid)
				if (msg.userid == UserManager.me.userID)
					throw "oops... an already existing user has the same name than me";

				UserManager.add(msg.userid);
				break;
			case "wait":
				Loading.show();
				break;
			case "ready": //oh you are ready to participate!
				Loading.hide();
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
					//getCanvas().toBlob((blob) => Share.sendFullCanvas(blob, msg.userid));
					Share.send({ type: "wait", to: msg.userid });
					//Share.send({type: "actions", to: msg.userid, actions: BoardManager.cancelStack.serialize(), t: BoardManager.cancelStack.t});
					Share.sendFullCanvas(msg.userid);

					Share.send({
						type: "svg", to: msg.userid,
						data: document.getElementById("svg").innerHTML
					});

					Share.sendMagnets(msg.userid);
					Share.send({ type: "ready", to: msg.userid });
					Share.execute("setUserCanWrite", [msg.userid, Share.canWriteValueByDefault]);
					Share.execute("setDocuments", [Background.getDocumentPanel().innerHTML]);

					for (const userid in UserManager.users)
						Share.execute("setUserName", [userid, UserManager.users[userid].name]);

					if (Background.is)
						Share.execute("setBackground", [Background.dataURL]);
				}

				break;
			case "leave":
				UserManager.leave(msg.userid);
				break;
			case "fullCanvas":
				Loading.hide();
				BoardManager.load(msg.data);
				break;
			case "actions":
				Loading.hide();
				BoardManager.cancelStack.load(msg.actions, msg.t);
				break;
			case "svg":
				console.log("received svg!")
				document.getElementById("svg").innerHTML = msg.data;
				ConstraintDrawing.reset();
				break;
			case "magnets":
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
			case "execute":
				ShareEvent[msg.event](...msg.params);
				break;
		}
	}


	/**
	 * modify the interface to say that the current user is root (all privileges)
	 */
	static setRoot(): void {
		document.getElementById("askPrivilege").hidden = true;
		document.getElementById("shareMode").hidden = false;
	}

	/**
	 *
	 * @param {*} msg as an object
	 * @description send the message to server
	 *
	 */
	static send(msg: ShareMessage): void {
		msg.id = Share.id; //adds the ID of the current board to the message
		this.ws.send(JSON.stringify(msg));
	}

	/**
	 *
	 * @param {*} blob
	 * @param {*} to
	 * @description send the blob of the canvas to the user to
	 */
	static sendFullCanvas(to?: string): void {
		Share.send({ type: "fullCanvas", data: getCanvas().toDataURL(), to: to }); // at some point send the blob directly
	}


	/**
	 *
	 * @param to
	 * @description send all the magnets to to. If to is undefined, send to all.
	 */
	static sendMagnets(to?: string): void {
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
	static sendNewMagnet(element: HTMLElement): void {
		console.log("new magnet sent!")
		Share.send({ type: "newmagnet", data: element.outerHTML });
	}


	/**
	 *
	 * @param element
	 * @description send the new information about an existing magnet
	 */
	static sendMagnetChanged(element: HTMLElement): void {
		Share.send({ type: "magnetChanged", magnetid: element.id, data: element.outerHTML });
	}


	/**
	 *
	 * @param {*} event, an event name (string), that is a method of the class ShareEvent
	 * @param {*} params an array of parameters
	 * @description executes the event with the params, that is execute the method event of the class ShareEvent
	 * with the params. Then send a message to server that this event should be executed for the other users as well
	 */
	static execute(event: string, params: Parameter[]): void {
		function adapt(obj) {
			if (obj instanceof MouseEvent) {
				return { pressure: (<PointerEvent>obj).pressure, offsetX: obj.offsetX, offsetY: obj.offsetY, shiftKey: obj.shiftKey };
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
		//eval("ShareEvent." + event)(...params);
		ShareEvent[event](...params);
		if (Share.isShared())
			Share.send(<ShareMessage>{ type: "execute", event: event, params: params.map((param) => adapt(param)) });
	}


	/**
	 *
	 * @param id
	 * @description set the ID of the current board
	 */
	static _setTableauID(id: string): void {
		Share.id = id;

		const url = document.location.href;

		const newUrl = url + "?id=" + id;
		history.pushState({}, null, newUrl);

		(<HTMLInputElement>document.getElementById("shareUrl")).value = url.startsWith("file://") ? config.server.frontend + "?id=" + id : newUrl;

		UserManager.updateGUIUsers(); //update the user because now the tableau is shared
		//document.getElementById("canvas").toBlob((blob) => Share.sendFullCanvas(blob));

	}










	/**
	 * @returns yes if the current URL is an URL of a shared board
	 */
	static isSharedURL(): boolean {
		const params = (new URL(document.location.href)).searchParams;
		return params.get('id') != null;
	}


	/**
	 * @returns the current tableaunoir ID
	 */
	static getTableauNoirID(): string {
		if (Share.isSharedURL()) {
			return Share.getIDInSharedURL();
		}
		else
			return "local";
	}

	/**
	 * @returns the current tableaunoir ID
	 */
	static getIDInSharedURL(): string {
		const params = (new URL(document.location.href)).searchParams;
		return params.get('id');
	}



	/**
	 *
	 * @param id
	 * @description say that the current user wants to join the tableaunoir id
	 */
	static join(id: string): void {
		Share.send({ type: "join", id: id });
	}


	/**
	 *
	 * @param canWrite
	 * @description if canWrite == true, makes that everybody can draw, otherwise only you can
	 */
	static setCanWriteForAllExceptMeAndByDefault(canWrite: boolean): void {
		document.getElementById("imgWritePermission" + canWrite).hidden = false;
		document.getElementById("imgWritePermission" + !canWrite).hidden = true;

		(<HTMLInputElement>document.getElementById("sharePermissionWrite")).checked = canWrite;

		for (const userid in UserManager.users) {
			if (UserManager.users[userid] != UserManager.me)
				Share.execute("setUserCanWrite", [userid, canWrite]);
		}
		Share.canWriteValueByDefault = canWrite;
		Share.execute("setUserCanWrite", [UserManager.me.userID, true]);
	}


}
