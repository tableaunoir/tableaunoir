/**
 * An operation is performed by the user and can be undone/redone.
 * 
 * Examples of instantiation:
 * 1. draw a line will correspond to an operation of "adding an action that draws a line, at a particular timestep in the timeline"
 * 2. remove an action in the timeline
 */
export abstract class Operation {
    abstract undo():void;
    abstract redo():void;
}