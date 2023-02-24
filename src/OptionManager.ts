/**
 * The OptionManager handles the option that are saved in the localStorage.
 */

export class OptionManager {

    /**
     * 
     * @param name
     * @returns the corresponding HTMLInputElement element 
     */
    private static getInputElement(name: string): HTMLInputElement {
        const el = <HTMLInputElement>document.getElementById("input" + name);
        const el2 = <HTMLInputElement>document.getElementById("input" + name[0].toUpperCase() + name.substr(1));

        return el ? el : el2;
    }


    /**
 * 
 * @param name
 * @returns the corresponding HTMLInputElement element 
 */
    private static getInputElementsByName(name: string): NodeListOf<HTMLInputElement> {
        const el = document.getElementsByName("input" + name);
        const el2 = document.getElementsByName("input" + name[0].toUpperCase() + name.substr(1));

        if (el.length > 0)
            return <NodeListOf<HTMLInputElement>>el;
        else
            return <NodeListOf<HTMLInputElement>>el2;
    }

    /**
     * 
     * @param name 
     * @param onChangeCallBack 
     * @description declares a boolean option of name name. At initialization, and when changed call onChangeCallBack.
     * Also that boolean is implicitely connected with an HTMLInputElement called "input" + name, that should be a checkbox 
     */
    //static boolean({name: string, onChangeCallBack: (boolean) => void}): void {
    static boolean({ name, defaultValue, onChange }: { name: string, defaultValue: boolean, onChange: (boolean) => void }): void {
        const el = OptionManager.getInputElement(name);
        const initialValue = localStorage.getItem(name) === null ? defaultValue : parseBoolean(localStorage.getItem(name));
        //console.log(`reading option ${name}: ${localStorage.getItem(name)}`)
        el.checked = initialValue;
        onChange(el.checked);
        el.onchange = () => {
            localStorage.setItem(name, el.checked.toString());
            onChange(el.checked);
        };
    }



    static toggle(name: string): void {
        const el = OptionManager.getInputElement(name);
        el.click();
    }

    static string({ name, defaultValue, onChange }: { name: string, defaultValue: string, onChange: (string) => void }): void {
        const initialValue: string = (localStorage.getItem(name) === null) ? defaultValue : localStorage.getItem(name);
        const el = OptionManager.getInputElement(name);

        onChange(initialValue);

        if (el != undefined) {
            //console.log(`reading option ${name}: ${localStorage.getItem(name)}`)
            el.value = initialValue;

            el.oninput = () => {
                localStorage.setItem(name, el.value.toString());
                onChange(el.value);
            };
        }

        else {
            const els = OptionManager.getInputElementsByName(name);
            for (let i = 0; i < els.length; i++) {
                const radioInput = els[i];
                if (radioInput.value == initialValue)
                    radioInput.checked = true;
                radioInput.onclick = () => {
                    localStorage.setItem(name, radioInput.value.toString());
                    onChange(radioInput.value);
                };
            }

        }
    }


    static number({ name, defaultValue, onChange }: { name: string, defaultValue: number, onChange: (number) => void }): void {
        const el = OptionManager.getInputElement(name);
        const initialValue = localStorage.getItem(name) ?? defaultValue;
        //console.log(`reading option ${name}: ${localStorage.getItem(name)}`)
        el.value = "" + initialValue;
        onChange(el.value);
        el.oninput = () => {
            localStorage.setItem(name, el.value);
            onChange(el.value);
        };
    }

}



function parseBoolean(str: string): boolean {
    if (str == "true") return true;
    if (str == "false") return false;
    throw `string ${str} does not represent a boolean value`;
}