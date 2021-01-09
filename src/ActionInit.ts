import { Action } from "./Action";


export class ActionInit extends Action {
    serialize(): Object {
        return {type: "init"};
    }

    async redo(): Promise<void> { /** does nothing */}

}