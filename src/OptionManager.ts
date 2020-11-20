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
    //static boolean({name: string, onChangeCallBack: (boolean) => void}): void {
    static boolean({ name, defaultValue, onChange }: { name: string, defaultValue: boolean, onChange: (boolean) => void }) {
        const el = OptionManager.getInputElement(name);
        const initialValue = (localStorage[name] == undefined) ? defaultValue : parseBoolean(localStorage[name]);
        //console.log(`reading option ${name}: ${localStorage[name]}`)
        el.checked = initialValue;
        onChange(el.checked);
        el.onchange = () => {
            localStorage[name] = el.checked;
            onChange(el.checked);
        };
    }

static string({ name, defaultValue, onChange }: { name: string, defaultValue: string, onChange: (string) => void }) {
    const el = OptionManager.getInputElement(name);
    const initialValue = (localStorage[name] == undefined) ? defaultValue : localStorage[name];
    //console.log(`reading option ${name}: ${localStorage[name]}`)
    el.value = initialValue;
    onChange(el.value);
    el.onchange = () => {
        localStorage[name] = el.value;
        onChange(el.value);
    };
}

}



function parseBoolean(str: string): boolean {
    if (str == "true") return true;
    if (str == "false") return false;
    throw `string ${str} does not represent a boolean value`;
}