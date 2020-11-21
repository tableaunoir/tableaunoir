export class Loading {
    static show() {
        document.getElementById("loading").hidden = false;
    }

    static hide() {
        document.getElementById("loading").hidden = true;
    }
}