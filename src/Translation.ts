import { OptionManager } from './OptionManager';
import { ShowMessage } from './ShowMessage';

/**
 * Languages that are available. A translation file should be present for each language, except "en" which is the reference language: fr.json for instance, ...
 */
const availableLanguage = ["fr", "en", "de", "es"];

/**
 * This class enables to translate Tableaunoir in other languages (french for instance)
 */
export class Translation {

    /**
     * The English dictionnary is empty. But we store on the fly the English dictionnary in order to be able to translate back in English if the user selects English!
     */
    private static readonly englishDict = {}; 

    /**
     * initialization
     */
    static init(): void {
        try {
            setTimeout(() => OptionManager.string({
                name: "language",
                defaultValue: availableLanguage.indexOf(navigator.language)>=0 ? navigator.language : "en", // the by-default language is the language of the system, and English if not available
                onChange: (s) => { Translation.translate(s); }
            }), 1000);
        }
        catch (e) {
            ShowMessage.error(e);
        }
    }


    /**
     * @returns a promise on the dictionnary of the selected language
     */
    static fetchDictionary(language: string): Promise<{ [index: string]: string }> {
        if (language == null || language == "en") //English is the reference language
            return new Promise(() => {
                //TODO:
            });

        return fetch(language + ".json").then(txt => txt.json());
    }

    /**
     *
     * @param element HTML element
     * @param dict
     * @description translate the HTML element:
     *         - translate its title property
     *         - call itself recursively if the element is not primitive
     */
    static translateElement(element: Element, dict: { [index: string]: string }): void {
        if (element.children == undefined)
            return;

        if ((<HTMLElement>element).title != undefined) {
            if (dict[(<HTMLElement>element).title.trim()]) {
                Translation.setEnglishDictEntry(dict[(<HTMLElement>element).title], (<HTMLElement>element).title);
                (<HTMLElement>element).title = dict[(<HTMLElement>element).title];
            }

        }

        if (element.children.length == 0) {
            if (dict[element.innerHTML.trim()]) {
                Translation.setEnglishDictEntry(dict[element.innerHTML.trim()], element.innerHTML);
                element.innerHTML = dict[element.innerHTML];
            }

        } else {
            for (const i in element.children)
                Translation.translateElement(element.children[i], dict);

        }
    }


    /**
     * 
     * @param key 
     * @param text
     * @description set the entry (key, text) in the English dictionnary if it is already set up
     */
    static setEnglishDictEntry(key: string, text: string): void {
        if (Translation.englishDict[key] == undefined)
            Translation.englishDict[key] = text;
    }
    /**
     *
     * @param dict
     * @description translates the element by the IDs
     */
    static translateFromIDs(dict: { [index: string]: string }): void {
        for (const key in dict) {
            if (key.startsWith('#') && !key.endsWith(".title")) {
                const element = document.getElementById(key.substr(1));

                if (element == undefined)
                    console.log(`Language translation: Element ${key} not found.`);
                else {
                    if (element.children.length > 0)
                        console.log(`Language translation: I refuse to translate because element ${key}  has some children.`);

                    Translation.setEnglishDictEntry(key, element.innerHTML);
                    element.innerHTML = dict[key];
                }
            }
        }
    }

    /**
    *
    * @param dict
    * @description translates the element by the IDs
    */
    static translateFromIDsTitle(dict: { [index: string]: string }): void {
        for (const key in dict) {
            if (key.startsWith('#') && key.endsWith(".title")) {
                const id = key.substr(1, key.length - 7);
                const element = document.getElementById(id);

                if (element == undefined)
                    console.log(`Language translation: Element of id ${id} not found. Thus I cannot translate ${key}`);
                else {
                    Translation.setEnglishDictEntry(key, element.title);
                    element.title = dict[key];
                }

            }
        }
    }




    /**
     * 
     * @param dict a dictionnary 
     */
    static translateD(dict: { [index: string]: string }): void {
        Translation.translateElement(document.getElementById("controls"), dict);
        Translation.translateElement(document.getElementById("menu"), dict);
        Translation.translateFromIDs(dict);
        Translation.translateFromIDsTitle(dict);
    }

    /**
     * big translation procedure
     */
    static translate(language: string): void {
        Translation.translateD(Translation.englishDict);
        if (language != "en")
            Translation.fetchDictionary(language).then(Translation.translateD);

    }
}
