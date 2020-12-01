import { ErrorMessage } from './ErrorMessage';

/**
 * This class enables to translate Tableaunoir in other languages (french for instance)
 */
export class Translation {

    /**
     * initialization
     */
    static init(): void {
        try {
            Translation.translate();
        }
        catch (e) {
            ErrorMessage.show(e);
        }

    }

    /**
     * @returns the language written in the URL (for instance "fr"), or null if none is provided
     */
    static getLanguage(): string {
        const params = (new URL(document.location.href)).searchParams;
        return params.get('lang');
    }


    /**
     * @returns a promise on the dictionnary of the selected language
     */
    static fetchDictionary(): Promise<{ [index: string]: string }> {
        const language = Translation.getLanguage();

        if (language == null)
            return new Promise(() => {
                //TODO:
             });

        return fetch("src/" + language + ".json")
            .then(txt => txt.json())

    }

    /**
     *
     * @param element HTML element
     * @param dict
     * @description translate the HTML element
     */
    static translateElement(element: Element, dict: { [index: string]: string }): void {
        if (element.children == undefined)
            return;

        if ((<HTMLElement>element).title == undefined) {
            if (dict[(<HTMLElement>element).title])
                (<HTMLElement>element).title = dict[(<HTMLElement>element).title];
        }

        if (element.children.length == 0) {
            if (dict[element.innerHTML])
                element.innerHTML = dict[element.innerHTML];
        } else {
            for (const i in element.children)
                Translation.translateElement(element.children[i], dict);

        }
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
                    console.log(`Element ${key} not found. I can translate..`);

                if (element.children.length > 0)
                    console.log("I refuse to translate because the element has some children.");

                element.innerHTML = dict[key];
            }
        }
    }
    /**
     * big translation procedure
     */
    static translate(): void {
        const dictionnary = Translation.fetchDictionary();
        dictionnary.then(dict => {
            Translation.translateElement(document.getElementById("controls"), dict);
            Translation.translateElement(document.getElementById("menu"), dict);
            Translation.translateFromIDs(dict);


        }
        )
    }
}
