import { Action } from "./Action";


export class ActionInit extends Action {
    async redo(): Promise<void> { /** does nothing */}

}