import { Share } from './share';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';




export default class MagnetTextManager {

	/**
	 * @description call the LaTEX engine (MathJaX)
	 */
	static latexTypeSet() {
		try {
			eval("MathJax.typeset();");
		}
		catch (e) {
			console.log("MathJaX not supported");
		}
	}
	/**
	 * 
	 * @param element 
	 * @returns true if the element is a text magnet
	 */
	public static isTextMagnet(element: HTMLElement): boolean {
		return element.classList.contains("magnetText");
	}




	/**
	 * 
	 * @param element 
	 * @param LaTEXCode e.g. "\frac x y" (do not put the $ etc.)
	 * @description update the magnet element to be the rendering of the latex code LaTEXCode
	 */
	private static setLaTEX(element: HTMLElement, LaTEXCode: string): void {
		const divText = <HTMLElement>element.children[0];
		element.dataset.type = "LaTEX";
		element.dataset.code = LaTEXCode;
		divText.contentEditable = "false";
		divText.innerHTML = `\\[${element.dataset.code}\\]`;
		MagnetTextManager.latexTypeSet();

		if (Share.isShared())
			Share.sendMagnetChanged(element);
	}


	/**
	 * 
	 * @param element
	 * @returns the corresponding latex that is written raw in element, or undefined otherwise if there is no such raw LaTEX code
	 */
	private static recognizeLaTEXCode(element: HTMLElement): string {
		function recognizeLaTEXCodeInDiv(divText): string {
			const text = divText.innerHTML;
			if (text.startsWith("$") && text.endsWith("$")) { //recognize $....$
				return text.substring(1, text.length - 1);
			}
			else if (text.startsWith("$") && text.endsWith("$<br>")) { //for some reasons, on Firefox, adding a space adds a fake "<br>" at the end
				return text.substring(1, text.length - "$<br>".length);
			}
			else if (text.startsWith("\\[") && text.endsWith("\\]")) {
				return text.substring(2, text.length - 2);
			}
			else return undefined;
		}

		const divText = <HTMLElement>element.children[0];
		const laTEXCodeDirect = recognizeLaTEXCodeInDiv(divText); //LaTEX code directly extracted from the HTML code of divText

		if (laTEXCodeDirect)
			return laTEXCodeDirect;
		else if (divText.children.length == 1) //maybe divText contains a unique div (it happens when new lines were created and deleted)
			return recognizeLaTEXCodeInDiv(<HTMLElement>divText.children[0]);
		else
			return undefined;



	}



	/**
	 * 
	 * @param element 
	 * @decription this function tries to see whether the element is a LaTEX magnet.
	 * If yes it parses it and shows the formula
	 */
	private static maybeRecognizeLaTEX(element: HTMLElement): void {
		const latexCode = MagnetTextManager.recognizeLaTEXCode(element);

		if (latexCode != undefined)
			MagnetTextManager.setLaTEX(element, latexCode);
		else //else there may be some standard LaTEX "\[...\]" inside the text magnet
			MagnetTextManager.latexTypeSet();
	}

	/**
	 *
	 * @param element
	 * @description set up the text magnet: add the mouse event, key event for editing the text magnet
	 */
	public static installMagnetText(element: HTMLElement): void {
		MagnetTextManager.maybeRecognizeLaTEX(element);
		const divText = <HTMLElement>element.children[0];

		element.ondblclick = () => {
			if (element.dataset.type == "LaTEX") {
				const answer = prompt("Type the LaTEX code: (e.g. \frac 1 2)", element.dataset.code);

				if (answer)
					MagnetTextManager.setLaTEX(element, answer);
			}
		}

		divText.onpointerdown = (e) => { e.stopPropagation(); }
		divText.onpointermove = (e) => { e.stopPropagation(); }
		divText.onpointerup = (e) => {
			if (document.activeElement == divText) //if edit mode then the click should stop here
				e.stopPropagation();
			//otherwise, we do not stop (maybe the magnet is dragged! #144)
		}

		divText.onkeydown = (e) => {
			const setFontSize = (size) => {
				divText.style.fontSize = size + "px";
				for (let i = 0; i < divText.children.length; i++) {
					(<HTMLElement>divText.children[i]).style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape") {
				divText.blur();

				MagnetTextManager.maybeRecognizeLaTEX(element);


				window.getSelection().removeAllRanges();
				/*if(divText.innerHTML == "")
					MagnetManager.remove(div);*/
			}
			if ((e.ctrlKey && e.key == "=") || (e.ctrlKey && e.key == "+")) { // Ctrl + +

				let size = parseInt(divText.style.fontSize);
				size++;
				setFontSize(size);
				e.preventDefault();

			}
			else if (e.ctrlKey && e.key == "-") { // Ctrl + -
				let size = parseInt(divText.style.fontSize);
				if (size > 6) size--;
				setFontSize(size);
				e.preventDefault();
			}


			e.stopPropagation();
		}

		divText.onkeyup = evt => {
			Share.execute("magnetChange", [UserManager.me.userID, element.id, element.outerHTML]);
			/*if (Share.isShared())
				Share.sendMagnetChanged(element);*/
			evt.stopPropagation();
		};
	}


	/**
	 *
	 * @param {*} x
	 * @param {*} y
	 * @description adds a new magnet text at position x and y
	 */
	public static addMagnetText(x: number, y: number): void {
		const div = document.createElement("div");
		const divText = document.createElement("div");

		div.appendChild(divText);
		divText.innerHTML = "type text";
		divText.contentEditable = "true";
		divText.style.fontSize = "24px";
		divText.style.color = UserManager.me.color;
		div.classList.add("magnetText");

		div.style.left = x + "px";
		div.style.top = y + "px";
		MagnetManager.addMagnet(div);



		if (Share.isShared())
			Share.sendMagnetChanged(div);

		/*divText.focus();
		document.execCommand('selectAll', false, null);
		setTimeout(() => divText.focus(), 200);*/


		function focusAndSelectAll(idmagnet: string) {
			const divText = <HTMLElement>document.getElementById(idmagnet).children[0]
			divText.focus();
			const range = document.createRange()
			const sel = window.getSelection()

			range.selectNodeContents(divText);

			sel.removeAllRanges()
			sel.addRange(range)
		}

		//accessing the dom via the id instead of the div itself, because the div may have been modified after addMagnet
		setTimeout(() => focusAndSelectAll(div.id), 50);
	}
}