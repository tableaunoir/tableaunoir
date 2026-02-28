import { Share } from './share';
import { MagnetManager } from './magnetManager';
import { UserManager } from './UserManager';
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';



/**
 * This class is the class for a <markdown-magnet>Type text</markdown-magnet> element
 * This magnet contains markdown code and we can toggle the edit mode (where the user can write the markdown code)
 * and the rendering (the HTML content corresponding to the markdown code)
 */
class MarkdownMagnet extends HTMLElement {

	private connectedCallback() {
		const shadow = this.attachShadow({
			mode: 'open',
			delegatesFocus: true // so that Firefox understands when the focus is removed from the text magnet (the editor)
		});
		const element = this;

		const style = document.createElement("style");
		style.textContent = `
    div {
			background-color: rgba(128, 128, 128, 0.2);
			font-weight: normal;
			cursor: text;
			min-width: 4px;
	}

	p {
		margin: 4px;
	}
    `;
		this.shadowRoot.appendChild(style);


		/**
		 * we include the highlightjs style here since it should be visible from the shadow
		 */
		const highlightjsstyle = document.createElement("style");
		highlightjsstyle.textContent = `/*!
  Theme: Bright
  Author: Chris Kempson (http://chriskempson.com)
  License: ~ MIT (or more permissive) [via base16-schemes-source]
  Maintainer: @highlightjs/core-team
  Version: 2021.09.0
*/pre code.hljs{display:block;overflow-x:auto;padding:1em}code.hljs{padding:3px 5px}.hljs{color:#e0e0e0;background:#000}.hljs ::selection,.hljs::selection{background-color:#505050;color:#e0e0e0}.hljs-comment{color:#b0b0b0}.hljs-tag{color:#d0d0d0}.hljs-operator,.hljs-punctuation,.hljs-subst{color:#e0e0e0}.hljs-operator{opacity:.7}.hljs-bullet,.hljs-deletion,.hljs-name,.hljs-selector-tag,.hljs-template-variable,.hljs-variable{color:#fb0120}.hljs-attr,.hljs-link,.hljs-literal,.hljs-number,.hljs-symbol,.hljs-variable.constant_{color:#fc6d24}.hljs-class .hljs-title,.hljs-title,.hljs-title.class_{color:#fda331}.hljs-strong{font-weight:700;color:#fda331}.hljs-addition,.hljs-code,.hljs-string,.hljs-title.class_.inherited__{color:#a1c659}.hljs-built_in,.hljs-doctag,.hljs-keyword.hljs-atrule,.hljs-quote,.hljs-regexp{color:#76c7b7}.hljs-attribute,.hljs-function .hljs-title,.hljs-section,.hljs-title.function_,.ruby .hljs-property{color:#6fb3d2}.diff .hljs-meta,.hljs-keyword,.hljs-template-tag,.hljs-type{color:#d381c3}.hljs-emphasis{color:#d381c3;font-style:italic}.hljs-meta,.hljs-meta .hljs-keyword,.hljs-meta .hljs-string{color:#be643c}.hljs-meta .hljs-keyword,.hljs-meta-keyword{font-weight:700}`;

		this.shadowRoot.appendChild(highlightjsstyle);


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
			this.toggleRenderingMode();
			window.getSelection().removeAllRanges();

			Share.execute("magnetChange", [UserManager.me.userID, element.id, element.outerHTML]);
		}

		divCode.addEventListener('focusout', (e) => { validate(); });


		divCode.onkeydown = (e) => {
			if (e.key == "Escape")
				validate();
			if ((e.ctrlKey && e.key == "=") || (e.ctrlKey && e.key == "+")) { // Ctrl + +

				let size = this.fontSize;
				size++;
				this.fontSize = size;
				e.preventDefault();

			}
			else if (e.ctrlKey && e.key == "-") { // Ctrl + -
				let size = this.fontSize
				if (size > 6) size--;
				this.fontSize = size;
				e.preventDefault();
			}
			else if (e.key == "PageDown" || e.key == "PageUp") {
				e.preventDefault(); // to prevent a weird behavior where the text magnet moves at the top
			}

			e.stopPropagation();
		}

		divCode.onkeyup = evt => {
			const code = divCode.innerText;
			this.textContent = code;
			//Share.execute("magnetChange", [UserManager.me.userID, element.id, element.outerHTML]);
			if (Share.isShared())
				Share.sendMagnetChanged(element);
			evt.stopPropagation();
		};


		this.toggleRenderingMode();
	}





	/**
	 * @description toggle to the rendering mode (we display the HTML content corresponding to the markdown code)
	 */
	private toggleRenderingMode(): void {
		const divCode = this.editorElement;
		const divContent = this.renderingElement;
		const code = divCode.innerText;
		this.textContent = code;

		divContent.innerHTML = markdownToHTML(code);
		divContent.hidden = false;
		divCode.hidden = true;

		MagnetTextManager.latexTypeSet(divContent);
	}




	get fontSize(): number { return parseInt(this.style.fontSize); }
	set fontSize(size: number) { this.style.fontSize = size + "px"; }

	/**
	 * @description toggle to the edition mode where the user can change the markdown code
	 */
	private toggleCodeEditionMode(): void {
		const divCode = this.editorElement;
		const divContent = this.renderingElement;

		divCode.hidden = false;
		divContent.hidden = true;
		divCode.focus();

	}

	/**
	 * @returns a string with the markdown code
	 */
	private get markdownCode() { return this.textContent.trim(); }

	/**
	 * access to the HTML element corresponding respectively to the editor (in the code edition mode)
	 * and the rendering element (for the rendering mode)
	 */
	private get editorElement() { return <HTMLElement>this.shadowRoot.children[2] };
	private get renderingElement() { return <HTMLElement>this.shadowRoot.children[3] };


	/**
	 * @description toggle to the edition mode, give focus and select all the markdown code
	 */
	public toggleEditionModeAndSelectAll() {
		this.toggleCodeEditionMode();
		const divCode = this.editorElement;
		const range = document.createRange();
		const sel = window.getSelection();

		range.selectNodeContents(divCode);

		sel.removeAllRanges();
		sel.addRange(range);
	}
}


customElements.define('markdown-magnet', MarkdownMagnet);

/**
 * @description load the library "marked" to render the HTML element from some markdown code
 */
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


/**
 * 
 * @param markdownCode 
 * @returns the string of the HTML element 
 */
function markdownToHTML(markdownCode: string): string { return marked.parse(markdownCode, { async: false }); }


/**
 * This module contains function for handling text magnet aka "markdown magnet"
 */
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
		const invitationToWriteSomeThing = "type text";
		element.textContent = invitationToWriteSomeThing;
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
			magnet.toggleEditionModeAndSelectAll();

		}

		//accessing the dom via the id instead of the div itself, because the div may have been modified after addMagnet
		setTimeout(() => focusAndSelectAll(element.id), 50);
	}
}