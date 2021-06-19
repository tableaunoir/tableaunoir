export abstract class Operation {
    abstract undo():void;
    abstract redo():void;
}