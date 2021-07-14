import { Share } from './share';
import { LoadSave } from './LoadSave';

/**
 * @description this class looks whether Tableaunoir is running in a browser or as a desktop application (electron)
 */
export class DesktopApplicationManager {
    private static _desktop = true;

    static setFilename(fullpathfilename: string): void {
        if (DesktopApplicationManager.is) {
            const ipc = require('electron').ipcRenderer;
            ipc.send("filename", fullpathfilename);
        }
    }
    static init(): void {
        try {
            /** setting when desktop app*/
            const ipc = require('electron').ipcRenderer;// window.require('electron').remote.ipcRenderer;

            ipc.on("desktop", () => alert("desktop"));
            ipc.on("open", (evt, data) => {
                Share.execute("loadBoard", [data]);

            });
            ipc.on("save", () => ipc.send("save", LoadSave.getTableauNoirString()));

            console.log("Desktop version of Tableaunoir");
            DesktopApplicationManager._desktop = true;
        }
        catch (e) {
            /** setting when online web app*/
            console.log("Web version of Tableaunoir");
            DesktopApplicationManager._desktop = false;

            window.onbeforeunload = function () {
                return "If you leave Tableaunoir, you will lose any unsaved changes."; //this will probably not be shown since modern browser do not care
            }
        }
    }


    /**
     * @returns true if you are running the Tableaunoir desktop application
     */
    static get is(): boolean { return DesktopApplicationManager._desktop; }
}