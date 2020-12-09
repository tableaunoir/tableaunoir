export interface Action {

    /**
     * redo the action
     */
    redo(): Promise<void>;
}