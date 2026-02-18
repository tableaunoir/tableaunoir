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

try {
	(<any>window).MathJax.Hub.Config({
		tex2jax: {
			inlineMath: [['$', '$'], ['\\(', '\\)']],
			processEscapes: true
		}
	});
}
catch (e) {
	console.log("MathJaX not supported or impossible to configure");
}

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
	private static validateCode(element: HTMLElement): void {
		const divText = <HTMLElement>element.children[0];
		const divContent = <HTMLElement>element.children[1];
		const code = divText.innerText;

		divContent.innerHTML = markdownToHTML(code);
		divContent.hidden = false;
		divText.hidden = true;

		MagnetTextManager.latexTypeSet(divContent);

		if (Share.isShared())
			Share.sendMagnetChanged(element);
	}



	/**
	 *
	 * @param element
	 * @description set up the text magnet: add the mouse event, key event for editing the text magnet
	 */
	public static installMagnetText(element: HTMLElement): void {
		const divText = <HTMLElement>element.children[0];
		const divContent = <HTMLElement>element.children[1];

		divContent.onpointerdown = (e) => {
			e.stopPropagation();
		}

		divContent.onpointermove = (e) => { e.stopPropagation(); }

		divContent.onpointerup = (e) => {
			divText.hidden = false;
			divContent.hidden = true;
			divText.focus();
			//e.stopPropagation();

		};

		/*		divText.onblur = (e) => {
					MagnetTextManager.validateCode(element);
					window.getSelection().removeAllRanges();
				}
		*/

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
				divContent.style.fontSize = size + "px";
				for (let i = 0; i < divContent.children.length; i++) {
					(<HTMLElement>divContent.children[i]).style.fontSize = size + "px";
				}
			}


			if (e.key == "Escape") {
				divText.blur();

				MagnetTextManager.validateCode(element);
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


		MagnetTextManager.validateCode(element);

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

		const divCode = document.createElement("div");
		div.appendChild(divCode);
		divCode.innerHTML = "type text";
		divCode.style.fontSize = "24px";
		divCode.style.color = UserManager.me.color;
		divCode.contentEditable = "plaintext-only";

		const divContent = document.createElement("div");
		div.appendChild(divContent);
		divContent.innerHTML = "";
		divContent.style.fontSize = "24px";
		divContent.style.color = UserManager.me.color;
		divContent.hidden = true;

		MagnetManager.addMagnet(div);

		if (Share.isShared())
			Share.sendMagnetChanged(div);

		/*divText.focus();
		document.execCommand('selectAll', false, null);
		setTimeout(() => divText.focus(), 200);*/


		function focusAndSelectAll(idmagnet: string) {
			const divText = <HTMLElement>document.getElementById(idmagnet).children[0];
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