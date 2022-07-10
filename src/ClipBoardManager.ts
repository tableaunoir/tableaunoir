import { ErrorMessage } from "./ErrorMessage";

export class ClipBoardManager {
    static copy(stringToCopy: string, description: string): void {
        navigator.clipboard.writeText(stringToCopy);
        ErrorMessage.show(description + " copied!");
    }
}