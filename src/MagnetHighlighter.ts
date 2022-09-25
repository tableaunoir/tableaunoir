export class MagnetHighlighter {
    static highlight(magnet: HTMLElement) {
        magnet.classList.add("magnetHighlight");

    }


    static unhighlightAll() {
        const A = document.getElementsByClassName("magnet");
        for (let i = 0; i < A.length; i++) {
            MagnetHighlighter.unhighlight(<HTMLElement>A[i]);
        }
    }
    static unhighlight(magnet: HTMLElement) {
        magnet.classList.remove("magnetHighlight");
    }

}