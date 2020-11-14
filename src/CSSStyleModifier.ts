/**
 * by François Schwarzentruber
 * inspired from a code called jcssrule.js from Jean-Marc VIGLINO.
 */


export class CSSStyleModifier {

    static stylesheet;
    static rules = [];


    static init() {
        CSSStyleModifier.stylesheet = document.createElement('style');
        CSSStyleModifier.stylesheet.setAttribute('type', 'text/css');
        if (document.body) document.body.appendChild(CSSStyleModifier.stylesheet);
        else document.head.appendChild(CSSStyleModifier.stylesheet);
    }


    static update() {
        let css = '\n';
        CSSStyleModifier.rules.forEach(function (r) {
            css += r.selector + ' {' + r.property + ':' + r.value + '; }\n';
        });
        console.log(css);
        CSSStyleModifier.stylesheet.innerHTML = css;
    }

    /**
     * @example 
     * setRule("body", "background","red");  // Change background color of the body
     */
    static setRule(selector, property, value) {
        for (let rule of CSSStyleModifier.rules)
            if (rule.selector == selector && rule.property == property) {
                rule.value = value;
                CSSStyleModifier.update();
                return;
            }

        CSSStyleModifier.rules.push({ 'selector': selector, 'property': property, 'value': value });
        CSSStyleModifier.update();
    }
}
