import { UserManager } from './UserManager';
import { ActionMagnetNew } from './ActionMagnetNew';
import { ErrorMessage } from './ErrorMessage';
import { ActionSerialized } from './ActionSerialized';
import { Share } from './share';
import { ConstraintDrawing } from './ConstraintDrawing';
import { Layout } from './Layout';
import { getCanvas } from './main';
import { MagnetManager } from './magnetManager';
import { BoardManager } from './boardManager';
import { Menu } from './Menu'


/**
 * this class contains the code for loading/saving a tableaunoir. Also for importing images as magnets.
 */
export class LoadSave {

    static loadFromLocalStorage(): void {
        const name = Share.getTableauNoirID();
        if (localStorage[name])
            LoadSave.loadJSON(JSON.parse(localStorage[name]));
    }


    static saveLocalStorage(): void {
        const name = Share.getTableauNoirID();
        localStorage[name] = LoadSave.getTableauNoirString();
    }

    /**
     * @description initialize the button Save and the drag and drop of files
     */
    static init(): void {
        /**
         * load a file from the <input type="file"...>
         */
        (<HTMLInputElement>document.getElementById("file")).onchange = function () {
            LoadSave.loadFile((<HTMLInputElement>this).files[0]);
        };



        document.getElementById("save").onclick = LoadSave.save;

        document.getElementById("buttonCancelStackFlatten").onclick = () => Share.execute("cancelStackFlatten", []);



        document.body.ondragover = (event) => {
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();
        }
        document.body.ondrop = (event) => {
            // Prevent default behavior (Prevent file from being opened)
            event.preventDefault();

            if (event.dataTransfer.items) {
                // Use DataTransferItemList interface to access the file(s)
                for (let i = 0; i < event.dataTransfer.items.length; i++) {
                    console.log(i)
                    // If dropped items aren't files, reject them
                    if (event.dataTransfer.items[i].kind === 'file') {
                        const file = event.dataTransfer.items[i].getAsFile();
                        LoadSave.loadFile(file);
                    }
                    else {
                        /*
                        event.dataTransfer.items[i].getAsString((s) => {
                            const img = new Image();
                            img.style.left = Layout.getWindowLeft() + "px";
                            img.style.top = "0px";
                            img.src = s;
                            MagnetManager.addMagnet(img);
                        });*/

                    }
                }
            } else {
                // Use DataTransfer interface to access the file(s)
                for (let i = 0; i < event.dataTransfer.files.length; i++) {
                    const file = event.dataTransfer.items[i].getAsFile();
                    LoadSave.loadFile(file[i]);
                }
            }

        };
    }

    /**
     *
     * @param {File} file
     * @description load the file file
     */
    static loadFile(file: File): void {
        if (file) {
            const reader = new FileReader();
            reader.onerror = () => {
                //TODO: handle error
            };

            /** load a .tableaunoir file, that is, a file containing the blackboard + some magnets */
            if (file.name.endsWith(".tableaunoir")) {
                reader.readAsText(file, "UTF-8");
                reader.onload = function (evt) {
                    const s: string = <string>evt.target.result;
                    Share.execute("loadBoard", [s]);
                }
            }
            else {
                /** load an image and add it as a magnet */
                console.log("adding a magnet image")
                console.log(file)
                reader.readAsDataURL(file);
                reader.onerror = () => ErrorMessage.show("problem in loading image");
                reader.onload = function (evt) {
                    const img = new Image();
                    img.src = <string>evt.target.result;
                    img.style.left = Layout.getWindowLeft() + "px";
                    img.style.top = "0px";
                    MagnetManager.addMagnet(img);
                }
            }

            Menu.hide(); //hide the menu after loading
        }
    }



    /**
     *
     * @param file
     * @param callback
     * @descrption load the image in the file, once the file is loaded. Call the callback function.
     */
    static fetchImageFromFile(file: File, callback: (img: HTMLImageElement) => void): void {
        const reader = new FileReader();
        reader.onerror = function () {
            //TODO: handle error
        }
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            const img = new Image();
            img.src = <string>evt.target.result;
            img.onload = () => callback(img);
        }
    }

    /**
         *
         * @param file
         * @param callback
         * @descrption load the image in the file, once the file is loaded. Call the callback function.
         */
    static fetchFromFile(file: File, callback: (string) => void): void {
        const reader = new FileReader();
        reader.onerror = function () {
            //TODO: error
        }
        reader.readAsDataURL(file);
        reader.onload = function (evt) {
            callback(<string>evt.target.result);
        }
    }


    /**
     *
     * @param {*} obj
     * @description load the JSON object of a .tableaunoir file:
     * obj.canvasDataURL is the content of the canvas
     * obj.magnets is the HTML code of the magnets
     */
    static loadJSON(obj: { canvasDataURL?: string, actions: ActionSerialized[], t: number, width: number, height: number, magnets: string, svg: string, backgroundLayer: string, script: string }): void {
        console.log("loadJSON");

        BoardManager._clear();

        if (obj.width) {
            getCanvas().width = obj.width;
            getCanvas().height = obj.height;
        }

        if (obj.canvasDataURL) {
            console.log("canvas format!");
            BoardManager.load(obj.canvasDataURL);
        }

        document.getElementById("documentPanel").innerHTML = obj.backgroundLayer ? obj.backgroundLayer : "";

        if (obj.actions)
            BoardManager.timeline.load(obj.actions, obj.t);

        if (obj.magnets) { //old format
            document.getElementById("magnets").innerHTML = obj.magnets;
            const magnets = document.getElementById("magnets").children;
            for (let i = 0; i < magnets.length; i++) {
                const exists = BoardManager.timeline.actions.find((a) => {
                    if (a instanceof ActionMagnetNew)
                        return a.magnet.id == magnets[i].id;
                    else
                        return false;
                });
                if (!exists)
                    BoardManager.addAction(new ActionMagnetNew(UserManager.me.userID, <HTMLElement>magnets[i]));
            }
        }

        if (obj.svg)
            document.getElementById("svg").innerHTML = obj.svg;

        document.getElementById("script").innerHTML = obj.script ? obj.script : "";
        ConstraintDrawing.reset();
        MagnetManager.installMagnets();
    }


    static getTableauNoirObject(): any {
     //   const magnets = document.getElementById("magnets").innerHTML;
        const backgroundLayer = document.getElementById("documentPanel").innerHTML;
        //  const svg = document.getElementById("svg").innerHTML;
        const script = (<HTMLTextAreaElement>document.getElementById("script")).value;
        // const canvasDataURL = getCanvas().toDataURL();
        //const obj = { magnets: magnets, svg: svg, canvasDataURL: canvasDataURL };
        return {
            backgroundLayer: backgroundLayer,
             //magnets: magnets,
              width: getCanvas().width, height: getCanvas().height,
            actions: BoardManager.timeline.serialize(), t: BoardManager.timeline.getCurrentIndex(), script: script
        };
    }


    static getTableauNoirString(): string { return JSON.stringify(LoadSave.getTableauNoirObject()); }



    /**
     * @description save the blackboard and the magnets
     */
    static save(): void {
        LoadSave.download((<HTMLInputElement>document.getElementById("name")).value + ".tableaunoir", LoadSave.getTableauNoirString());
    }

    /**
     *
     * @param {*} filename
     * @param {*} text
     * @description propose to download a file called filename that contains the text text
     */
    static download(filename: string, text: string): void {
        LoadSave.downloadDataURL(filename, 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))

    }



    /**
 *
 * @param {*} filename
 * @param {*} dataURL
 * @description propose to download a file with the content
 */
    static downloadDataURL(filename: string, dataURL: string): void {
        const element = document.createElement('a');
        element.setAttribute('href', dataURL);
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

}


window["LoadSave"] = LoadSave;