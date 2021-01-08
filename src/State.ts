import { getCanvas } from './main';



export class State {

    blob: Blob;

    /**
     * @returns the current state
     */
    static createCurrentState(): State {
        const state = new State();

        getCanvas().toBlob((blob) => state.blob = blob);

        return state;
    }

    /**
     * @description set the current state
     */
    redo(): Promise<void> {
        return new Promise(resolve => {
            const canvas = getCanvas();
            const context = canvas.getContext("2d");
            const image = new Image();

            image.onload = function () {
                canvas.width = Math.max(canvas.width, image.width); // ugly
                canvas.height = image.height;

                context.drawImage(image, 0, 0);
                resolve();
            };
            image.src = URL.createObjectURL(this.blob);
        });
    }
}

