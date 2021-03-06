import { Share } from './share';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';




export class MagnetTextManager {
	/**
	 * 
	 * @param element 
	 * @returns true if the element is a text magnet
	 */
	static isTextMagnet(element: HTMLElement): boolean {
		return element.classList.contains("magnetText");
	}




	/**
	 * 
	 * @param element 
	 * @param LaTEXCode 
	 * @description update the magnet element to be the rendering of the latex code LaTEXCode
	 */
	static setLaTEX(element: HTMLElement, LaTEXCode: string): void {
		const divText = <HTMLElement>element.children[0];
		element.dataset.type = "LaTEX";
		element.dataset.code = LaTEXCode;
		divText.contentEditable = "false";
		divText.innerHTML = `\\[${element.dataset.code}\\]`;
		eval("MathJax.typeset();");

		if (Share.isShared())
			Share.sendMagnetChanged(element);
	}


	/**
	 * 
	 * @param element
	 * @returns the corresponding latex that is written raw in element, or undefined otherwise if there is no such raw LaTEX code
	 */
	static recognizeLaTEXCode(element: HTMLElement): string {
		function recognizeLaTEXCodeInDiv(divText): string {
			const text = divText.innerHTML;
			if (text.startsWith("$") && text.endsWith("$")) { //the magnet is transformed into a LaTEX magnet
				return text.substring(1, text.length - 1);
			}
			else if (text.startsWith("\\[") && text.endsWith("\\]")) {
				return text.substring(2, text.length - 2);
			}
			else return undefined;
		}

		const divText = <HTMLElement>element.children[0];

		if (divText.children.length == 0)
			return recognizeLaTEXCodeInDiv(divText);
		else if (divText.children.length == 1)
			return recognizeLaTEXCodeInDiv(<HTMLElement>divText.children[0]);
		else
			return undefined;



	}

	/**
	 *
	 * @param element
	 * @description set up the text magnet: add the mouse event, key event for editing the text magnet
	 */
	static installMagnetText(element: HTMLElement): void {

		const divText = <HTMLElement>element.children[0];

		element.ondblclick = () => {
			if (element.dataset.type == "LaTEX") {
				const answer = prompt("Type the LaTEX code:", element.dataset.code);

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
				for (const i in divText.children) {
					(<HTMLElement>divText.children[i]).style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape") {
				divText.blur();



				const latexCode = MagnetTextManager.recognizeLaTEXCode(element);

				if (latexCode != undefined)
					MagnetTextManager.setLaTEX(element, latexCode);
				else //else there may be some standard LaTEX "\[...\]" inside the text magnet
					eval("MathJax.typeset();")
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
	static addMagnetText(x: number, y: number): void {
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

		divText.focus();

		if (Share.isShared())
			Share.sendMagnetChanged(div);

		document.execCommand('selectAll', false, null);
	}
}