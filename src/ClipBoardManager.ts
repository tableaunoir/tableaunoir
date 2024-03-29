import { ShowMessage } from "./ShowMessage";

export class ClipBoardManager {


    /**
     * 
     * @param stringToCopy 
     * @param description 
     * @description copy stringToCopy in the clipboard, and show "description copied" to inform the user
     */
    static copy(stringToCopy: string, description: string): void {
        navigator.clipboard.writeText(stringToCopy);
        ShowMessage.show(description + " copied!");
    }
}