var Translation = /** @class */ (function () {
    function Translation() {
    }
    Translation.init = function () {
        try {
            Translation.translate();
        }
        catch (e) {
            ErrorMessage.show(e);
        }
    };
    /**
     * @returns the language written in the URL, or null if none is provided
     */
    Translation.getLanguage = function () {
        var params = (new URL(document.location)).searchParams;
        return params.get('lang');
    };
    Translation.fetchDictionary = function () {
        var language = Translation.getLanguage();
        if (language == null)
            return new Promise(function () { });
        return fetch("src/" + language + ".json")
            .then(function (txt) { return txt.json(); });
    };
    Translation.translateElement = function (element, dict) {
        if (element.children == undefined)
            return;
        if (element.title == undefined) {
            if (dict[element.title])
                element.title = dict[element.title];
        }
        if (element.children.length == 0) {
            if (dict[element.innerHTML])
                element.innerHTML = dict[element.innerHTML];
        }
        else {
            for (var i in element.children)
                Translation.translateElement(element.children[i], dict);
        }
    };
    Translation.translate = function () {
        var dictionnary = Translation.fetchDictionary();
        dictionnary.then(function (dict) {
            Translation.translateElement(document.getElementById("controls"), dict);
            Translation.translateElement(document.getElementById("menu"), dict);
            for (var key in dict) {
                if (key.startsWith('#')) {
                    var element = document.getElementById(key.substr(1));
                    if (element == undefined)
                        console.log("Element " + key + " not found. I can translate..");
                    if (element.children.length > 0)
                        console.log("I refuse to translate because the element has some children.");
                    element.innerHTML = dict[key];
                }
            }
        });
    };
    return Translation;
}());
//# sourceMappingURL=Translation.js.map