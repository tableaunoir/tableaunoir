export class Loading {
    static show(): void {
        document.getElementById("loading").hidden = false;
    }

    static hide(): void {
        document.getElementById("loading").hidden = true;
    }
}