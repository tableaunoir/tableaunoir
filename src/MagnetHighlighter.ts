/**
 * This class enables to highlight or unhighlight some magnets
 * it is used when we press Shift for drawing edges between magnets. 
 * By highlighting the magnets, the user sees which magnets will be connected.
 */

export class MagnetHighlighter {
    static highlight(magnet: HTMLElement): void {
        magnet.classList.add("magnetHighlight");
    }

    static unhighlightAll(): void { 
        const A = document.getElementsByClassName("magnetHighlight");
        for (let i = 0; i < A.length; i++) {
            MagnetHighlighter.unhighlight(<HTMLElement>A[i]);
        }
    }
    static unhighlight(magnet: HTMLElement): void {
        magnet.classList.remove("magnetHighlight");
    }

}