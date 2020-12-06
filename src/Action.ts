export interface Action {

    /**
     * undo the action
     */
    undo(): Promise<void>;


    /**
     * redo the action
     */
    redo(): Promise<void>;
}