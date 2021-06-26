import { AnimationToolBar } from './AnimationToolBar';
import { Action } from './Action';
import { CircularMenu } from './CircularMenu';



export class ActionTimeLineMenu extends CircularMenu {
    constructor(action: Action) {
        super();

        this.addButtonImage({
            src: "img/icons/1F411.svg",
            title: "Execute the action in parallel or not",
            onclick: () => {
                action.isBlocking = !action.isBlocking;
                AnimationToolBar.update();
                CircularMenu.hide();
            }
        });

        this.addButtonImage({
            src: "img/icons/1F6D1.svg",
            title: "Make that action a key action or not",
            onclick: () => {
                action.pause = !action.pause;
                AnimationToolBar.update();
                CircularMenu.hide();
            }
        });


        this.layout();
    }

}