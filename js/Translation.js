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
        });
    };
    return Translation;
}());
//# sourceMappingURL=Translation.js.map