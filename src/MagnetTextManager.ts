import { Share } from './share';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';


const marked = new Marked(
	markedHighlight({
		emptyLangClass: 'hljs',
		langPrefix: 'hljs language-',
		highlight(code, lang, info) {
			const language = hljs.getLanguage(lang) ? lang : 'plaintext';
			return hljs.highlight(code, { language }).value;
		}
	})
);



function markdownToHTML(code) { return marked.parse(code, { async: false }); }



export class MagnetTextManager {

	/**
	 * @description call the LaTEX engine (MathJaX)
	 */
	static latexTypeSet(element: HTMLElement) {
		try {
			(<any>window).MathJax.typeset([element]);
			//	eval("MathJax.typeset();");
		} catch (e) { console.log("MathJaX not supported"); }
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
	 * @param color 
	 * @description set the color of the text in the magnet element
	 */
	public static setColor(element: HTMLElement, color: string) {
		element.style.color = color;
		(<HTMLElement>element.children[0]).style.color = color;
	}

	/**
	 * 
	 * @param element 
	 * @returns the color of the text in the magnet element
	 */
	public static getColor(element: HTMLElement) {
		return (<HTMLElement>element.children[0]).style.color;
	}

	/**
	 * 
	 * @param element 
	 * @param markdown code e.g. "**equation** is $\frac x y = 1$"
	 * @description set the code to the text magnet
	 */
	private static toggleDisplayMode(element: HTMLElement): void {
		const divText = <HTMLElement>element.children[0];
		const divContent = <HTMLElement>element.children[1];
		const code = divText.innerText;

		divContent.innerHTML = markdownToHTML(code);
		divContent.hidden = false;
		divText.hidden = true;

		MagnetTextManager.latexTypeSet(divContent);
	}


	private static toggleCodeEditionMode(element: HTMLElement): void {
		const divCode = <HTMLElement>element.children[0];
		const divContent = <HTMLElement>element.children[1];

		divCode.hidden = false;
		divContent.hidden = true;
		divCode.focus();

	}

	/**
	 *
	 * @param element
	 * @description set up the text magnet: add the mouse event, key event for editing the text magnet
	 */
	public static installMagnetText(element: HTMLElement): void {
		const divCode = <HTMLElement>element.children[0];
		const divContent = <HTMLElement>element.children[1];

		if (divContent == undefined) { // just a test because the previous version of Tableaunoir did not have a content
			const divContent = document.createElement("div");
			element.appendChild(divContent);
			divContent.innerHTML = "";
			divContent.hidden = true;
			return this.installMagnetText(element);
		}

		let lastDownTarget = null; // prevent to toggleCodeEdition when moving the magnet

		divContent.onpointerdown = (e) => {
			lastDownTarget = e.target;
			e.stopPropagation();
		}

		divContent.onpointermove = (e) => { e.stopPropagation(); }

		divContent.onpointerup = (e) => {
			if (e.target === lastDownTarget)
				MagnetTextManager.toggleCodeEditionMode(element);
			//e.stopPropagation();

		};


		divCode.oncontextmenu = (e) => { e.stopPropagation(); }
		divCode.onpointerdown = (e) => { e.stopPropagation(); }
		divCode.onpointermove = (e) => { e.stopPropagation(); }
		divCode.onpointerup = (e) => {
			if (document.activeElement == divCode) //if edit mode then the click should stop here
				e.stopPropagation();
			//otherwise, we do not stop (maybe the magnet is dragged! #144)
		}



		function validate() {
			MagnetTextManager.toggleDisplayMode(element);
			window.getSelection().removeAllRanges();

			Share.execute("magnetChange", [UserManager.me.userID, element.id, element.outerHTML]);
		}

		divCode.onblur = (e) => {
			validate();
		}


		divCode.onkeydown = (e) => {
			const getFontSize = () => {
				return parseInt(element.style.fontSize);
			}
			const setFontSize = (size) => {
				element.style.fontSize = size + "px";
				divCode.style.fontSize = size + "px";
				divContent.style.fontSize = size + "px";

				for (let i = 0; i < divContent.children.length; i++) {
					(<HTMLElement>divContent.children[i]).style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape")
				validate();
			if ((e.ctrlKey && e.key == "=") || (e.ctrlKey && e.key == "+")) { // Ctrl + +

				let size = getFontSize();
				size++;
				setFontSize(size);
				e.preventDefault();

			}
			else if (e.ctrlKey && e.key == "-") { // Ctrl + -
				let size = getFontSize();
				if (size > 6) size--;
				setFontSize(size);
				e.preventDefault();
			}


			e.stopPropagation();
		}

		divCode.onkeyup = evt => {
			//Share.execute("magnetChange", [UserManager.me.userID, element.id, element.outerHTML]);
			/*if (Share.isShared())
				Share.sendMagnetChanged(element);*/
			evt.stopPropagation();
		};


		MagnetTextManager.toggleDisplayMode(element);

	}



	/**
	 *
	 * @param {*} x
	 * @param {*} y
	 * @description adds a new magnet text at position x and y
	 */
	public static addMagnetText(x: number, y: number): void {
		const div = document.createElement("div");
		div.classList.add("magnetText");
		div.style.left = x + "px";
		div.style.top = y + "px";
		div.classList.add("magnetText");
		div.style.fontSize = "24px";
		div.style.color = UserManager.me.color;

		const divCode = document.createElement("div");
		div.appendChild(divCode);
		divCode.innerHTML = "type text";
		divCode.contentEditable = "plaintext-only";
		divCode.style.margin = "2px";
		divCode.style.padding = "2px";

		const divContent = document.createElement("div");
		div.appendChild(divContent);
		divContent.innerHTML = "";
		divContent.hidden = true;

		MagnetManager.addMagnet(div);

		if (Share.isShared())
			Share.sendMagnetChanged(div);

		/*divText.focus();
		document.execCommand('selectAll', false, null);
		setTimeout(() => divText.focus(), 200);*/


		function focusAndSelectAll(idmagnet: string) {
			const magnet = document.getElementById(idmagnet);
			const divCode = <HTMLElement> magnet.children[0];
			divCode.focus();
			const range = document.createRange();
			const sel = window.getSelection();

			range.selectNodeContents(divCode);

			sel.removeAllRanges();
			sel.addRange(range);
		}

		//accessing the dom via the id instead of the div itself, because the div may have been modified after addMagnet
		setTimeout(() => focusAndSelectAll(div.id), 200);
	}
}