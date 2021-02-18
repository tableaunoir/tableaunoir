import { OptionManager } from './OptionManager';
import { ErrorMessage } from './ErrorMessage';

/**
 * This class enables to translate Tableaunoir in other languages (french for instance)
 */
export class Translation {

    private static readonly englishDict = {};

    /**
     * initialization
     */
    static init(): void {
        try {
            setTimeout(() => OptionManager.string({
                name: "language",
                defaultValue: "en",
                onChange: (s) => {
                    Translation.translate(s);
                }
            }), 1000);

        }
        catch (e) {
            ErrorMessage.show(e);
        }

    }


    /**
     * @returns a promise on the dictionnary of the selected language
     */
    static fetchDictionary(language: string): Promise<{ [index: string]: string }> {
        if (language == null || language == "en") //English is the by-default language
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
            if (dict[(<HTMLElement>element).title]) {
                Translation.setEnglishDictEntry(dict[(<HTMLElement>element).title], (<HTMLElement>element).title);
                (<HTMLElement>element).title = dict[(<HTMLElement>element).title];
            }

        }

        if (element.children.length == 0) {
            if (dict[element.innerHTML]) {
                Translation.setEnglishDictEntry(dict[element.innerHTML], element.innerHTML);
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
            if (key.startsWith('#')) {
                const element = document.getElementById(key.substr(1));

                if (element == undefined)
                    console.log(`Element ${key} not found. I cannot translate..`);
                else {
                    if (element.children.length > 0)
                        console.log("I refuse to translate because the element has some children.");

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
                    console.log(`Element of id ${id} not found. I cannot translate..`);
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
        if (!(language == "en")) {
            const dictionnary = Translation.fetchDictionary(language);
            dictionnary.then(Translation.translateD);
        }
    }
}
