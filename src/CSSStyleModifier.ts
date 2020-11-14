/**
 * by François Schwarzentruber
 * inspired from a code called jcssrule.js from Jean-Marc VIGLINO.
 * 
 * The class CSSStyleModifier enables to add new CSS rules on the fly.
 * In Tableaunoir, it is used for modifying the colors of many objects when switching from black/whiteboard. 
 */


export class CSSStyleModifier {

    static stylesheet;
    static rules = [];

    /**
     * @description add a new style part in the html
     */
    static init(): void {
        CSSStyleModifier.stylesheet = document.createElement('style');
        CSSStyleModifier.stylesheet.setAttribute('type', 'text/css');
        if (document.body) document.body.appendChild(CSSStyleModifier.stylesheet);
        else document.head.appendChild(CSSStyleModifier.stylesheet);
    }


    /**
     * update the html with the new rules
     */
    static update(): void {
        let css = '\n';
        CSSStyleModifier.rules.forEach(function (r) {
            css += r.selector + ' {' + r.property + ':' + r.value + '; }\n';
        });
        console.log(css);
        CSSStyleModifier.stylesheet.innerHTML = css;
    }

    /**
     * @param selector
     * @param property
     * @param value
     * @desription add a new rule for elements matching the selector. The property is assigned to the value.
     * @example 
     * setRule("body", "background","red");  // Change background color of the body
     */
    static setRule(selector: string, property: string, value: string): void {
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
