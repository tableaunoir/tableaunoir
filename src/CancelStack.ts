import { Operation } from './Operation';



export class CancelStack {
    /**
 * stack of operations (add an action, remove an action, etc.)
 */
    public operations: (Operation)[] = [];
    private currentIndex = -1; //meaning that operation[currentIndex] is treated and is the last operation executed



    /**
         * @returns true if there is some previous operation to undo
         */
    canUndo(): boolean { return this.currentIndex >= 0; }


    /**
     * @returns true if there is some next operation to redo
     */
    canRedo(): boolean { return this.currentIndex < this.operations.length - 1; }



    /**
* @description undo the last action
*/
    undo(): void {
        if (!this.canUndo)
            return;
        this.operations[this.currentIndex].undo();
        this.currentIndex--;
        this.updateButtons();
        /**
    this.currentIndex--;
    this.updateButtons();

    if (this.actions[this.currentIndex + 1].isDirectlyUndoable)
        await this.actions[this.currentIndex + 1].undo();
    else {
        getCanvas().width = getCanvas().width + 0;

        if (BoardManager.MAGNETCANCELLABLE)
            document.getElementById("magnets").innerHTML = "";
        await this.playUntilCurrentIndex();
        // this.print();

    } */


    }



    /**
     * 
     * @param action 
     * @description insert action at the current index
     */
    private _push(operation: Operation): void {

        this.currentIndex++;

        /** we remove all elements after the currentIndex */
        while (this.operations.length > this.currentIndex)
            this.operations.pop();

        this.operations.push(operation);

        this.currentIndex = this.operations.length - 1; //because we removed
    }






    /**
     *
     * @param {*} data
     */
    push(operation: Operation): void {
        //if (AnimationToolBar.is()) // the behavior should not change depending on the presence of the animation toolbar!
        this._push(operation);
        //else
        //  this._push(action);
        this.updateButtons();
        //this.print();
    }





    /**
     * @description redo the next action
     */
    redo(): void {
        if (!this.canRedo)
            return;

        this.currentIndex++;
        this.operations[this.currentIndex].redo();
        this.updateButtons();
    }





    /**
    * @description update the GUI
    */
    updateButtons(): void {
        if (this.canUndo())
            document.getElementById("buttonCancel").classList.remove("disabled");
        else
            document.getElementById("buttonCancel").classList.add("disabled");

        if (this.canRedo())
            document.getElementById("buttonRedo").classList.remove("disabled");
        else
            document.getElementById("buttonRedo").classList.add("disabled");
    }
}