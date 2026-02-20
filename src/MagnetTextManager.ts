import { Share } from './share';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';







class MarkdownMagnet extends HTMLElement {

	connectedCallback() {
		const shadow = this.attachShadow({ mode: 'open' });
		this.render();
	}


	/**
	 * 
	 * @param element 
	 * @param markdown code e.g. "**equation** is $\frac x y = 1$"
	 * @description set the code to the text magnet
	 */
	toggleDisplayMode(): void {
		const divCode = this.editorElement;
		const divContent = this.renderingElement;
		const code = divCode.innerText;
		this.textContent = code;

		divContent.innerHTML = markdownToHTML(code);
		divContent.hidden = false;
		divCode.hidden = true;

		MagnetTextManager.latexTypeSet(divContent);
	}


	toggleCodeEditionMode(): void {
		const divCode = this.editorElement;
		const divContent = this.renderingElement;

		divCode.hidden = false;
		divContent.hidden = true;
		divCode.focus();

	}
	get markdownCode() {
		return this.textContent.trim();
	}

	get editorElement() {return <HTMLElement>this.shadowRoot.children[1]};
	get renderingElement() {return <HTMLElement>this.shadowRoot.children[2]};
	
	render() {
		const element = this;

		const style = document.createElement("style");
		style.textContent = `
    div {
			background-color: rgba(128, 128, 128, 0.2);
			font-size: 24px;
			font-weight: normal;
			cursor: text;
			min-width: 4px;
	}

	p {
		margin: 4px;
	}
    `;

		this.shadowRoot.appendChild(style);

		const divCode = document.createElement("div");
		this.shadowRoot.appendChild(divCode);
		divCode.innerText = this.markdownCode;
		divCode.contentEditable = "plaintext-only";
		divCode.style.margin = "2px";
		divCode.style.padding = "2px";

		const divContent = document.createElement("div");
		this.shadowRoot.appendChild(divContent);
		divContent.innerHTML = "";
		divContent.hidden = true;

		let lastDownTarget = null; // prevent to toggleCodeEdition when moving the magnet

		divContent.onpointerdown = (e) => {
			lastDownTarget = e.target;
			e.stopPropagation();
		}

		divContent.onpointermove = (e) => { e.stopPropagation(); }

		divContent.onpointerup = (e) => {
			if (e.target === lastDownTarget)
				this.toggleCodeEditionMode();
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



		const validate = () => {
			this.toggleDisplayMode();
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
			else if (e.key == "PageDown" || e.key == "PageUp") {
				e.preventDefault(); // to prevent a weird behavior where the text magnet moves at the top
			}

			e.stopPropagation();
		}

		divCode.onkeyup = evt => {
			//Share.execute("magnetChange", [UserManager.me.userID, element.id, element.outerHTML]);
			/*if (Share.isShared())
				Share.sendMagnetChanged(element);*/
			evt.stopPropagation();
		};


		this.toggleDisplayMode();
	}










	focusAndSelectAll() {
		this.toggleCodeEditionMode();
		const divCode = this.editorElement;
		divCode.focus();
		const range = document.createRange();
		const sel = window.getSelection();

		range.selectNodeContents(divCode);

		sel.removeAllRanges();
		sel.addRange(range);
	}
}


customElements.define('markdown-magnet', MarkdownMagnet);


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
	 * @param {*} x
	 * @param {*} y
	 * @description adds a new magnet text at position x and y
	 */
	public static addMagnetText(x: number, y: number): void {
		const element = document.createElement("markdown-magnet");
		element.textContent = "type text";
		element.classList.add("magnetText");
		element.style.left = x + "px";
		element.style.top = y + "px";
		element.style.fontSize = "24px";
		element.style.color = UserManager.me.color;

		MagnetManager.addMagnet(element);

		if (Share.isShared())
			Share.sendMagnetChanged(element);

		function focusAndSelectAll(idmagnet: string) {
			const magnet = <MarkdownMagnet>document.getElementById(idmagnet);
			magnet.focusAndSelectAll();

		}

		//accessing the dom via the id instead of the div itself, because the div may have been modified after addMagnet
		setTimeout(() => focusAndSelectAll(element.id), 50);
	}
}