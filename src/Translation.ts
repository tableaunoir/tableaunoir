

class Translation {


    static init() {
        try {
            Translation.translate();
        }
        catch(e) {
            ErrorMessage.show(e);
        }
        
    }

    /**
     * @returns the language written in the URL, or null if none is provided
     */
    static getLanguage() {
        let params = (new URL(<any>document.location)).searchParams;
        return params.get('lang');
    }


    static fetchDictionary() {
        const language = Translation.getLanguage();

        if (language == null)
            return new Promise(() => { });

        return fetch("src/" + language + ".json")
            .then(txt => txt.json())

    }


    static translateElement(element: Element, dict) {
        if(element.children == undefined)
            return;
            
        if (element.children.length == 0) {
            if (dict[element.innerHTML])
                element.innerHTML = dict[element.innerHTML];
        } else {
            for (let i in element.children)
                Translation.translateElement(element.children[i], dict);

        }
    }


    static translate() {
        const dictionnary = Translation.fetchDictionary();
        dictionnary.then(dict => {
            Translation.translateElement(document.getElementById("controls"), dict);
            Translation.translateElement(document.getElementById("menu"), dict);

        }
            )
    }
}