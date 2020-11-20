/**
 * The OptionManager handles the option that are saved in the localStorage.
 */

export class OptionManager {
    static init(): void {

    }

    /**
     * 
     * @param name
     * @returns the corresponding HTMLInputElement element 
     */
    static getInputElement(name: string): HTMLInputElement {
        const el = <HTMLInputElement>document.getElementById("input" + name);
        const el2 = <HTMLInputElement>document.getElementById("input" + name[0].toUpperCase() + name.substr(1));

        return el ? el : el2;
    }


    /**
     * 
     * @param name 
     * @param onChangeCallBack 
     * @description declares a boolean option of name name. At initialization, and when changed call onChangeCallBack.
     * Also that boolean is implicitely connected with an HTMLInputElement called "input" + name, that should be a checkbox 
     */
    static boolean(name: string, onChangeCallBack: (boolean) => void): void {
        const el = OptionManager.getInputElement(name);
        const initialValue = (localStorage[name] == undefined) ? false : parseBoolean(localStorage[name]);
        //console.log(`reading option ${name}: ${localStorage[name]}`)
        el.checked = initialValue;
        onChangeCallBack(el.checked);
        el.onchange = () => {
            localStorage[name] = el.checked;
            onChangeCallBack(el.checked);
        };
    }

}



function parseBoolean(str: string): boolean {
    if (str == "true") return true;
    if (str == "false") return false;
    throw `string ${str} does not represent a boolean value`;
}