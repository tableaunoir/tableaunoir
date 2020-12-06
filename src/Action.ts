export interface Action {
    undo(): Promise<void>;
    redo(): Promise<void>;
}