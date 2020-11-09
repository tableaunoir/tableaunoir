/**
 * This class enables to translate Tableaunoir in other languages (french for instance)
 */
var Translation = /** @class */ (function () {
    function Translation() {
    }
    /**
     * initialization
     */
    Translation.init = function () {
        try {
            Translation.translate();
        }
        catch (e) {
            ErrorMessage.show(e);
        }
    };
    /**
     * @returns the language written in the URL (for instance "fr"), or null if none is provided
     */
    Translation.getLanguage = function () {
        var params = (new URL(document.location)).searchParams;
        return params.get('lang');
    };
    /**
     * @returns a promise on the dictionnary of the selected language
     */
    Translation.fetchDictionary = function () {
        var language = Translation.getLanguage();
        if (language == null)
            return new Promise(function () { });
        return fetch("src/" + language + ".json")
            .then(function (txt) { return txt.json(); });
    };
    /**
     *
     * @param element HTML element
     * @param dict
     * @description translate the HTML element
     */
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
    /**
     *
     * @param dict
     * @description translates the element by the IDs
     */
    Translation.translateFromIDs = function (dict) {
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
    };
    /**
     * big translation procedure
     */
    Translation.translate = function () {
        var dictionnary = Translation.fetchDictionary();
        dictionnary.then(function (dict) {
            Translation.translateElement(document.getElementById("controls"), dict);
            Translation.translateElement(document.getElementById("menu"), dict);
            Translation.translateFromIDs(dict);
        });
    };
    return Translation;
}());
//# sourceMappingURL=Translation.js.map