import { AnimationToolBar } from './AnimationToolBar';
import { Action } from './Action';
import { CircularMenu } from './CircularMenu';


/**
 * menu for actions
 */
export class ActionTimeLineMenu extends CircularMenu {
    constructor(action: Action) {
        super(true);
        this.radius = 40;
        this.addButtonImage({
            src: "img/icons/parallel.svg",
            title: "Execute the action in parallel or not. Make that we do not for the action(s) to finish. Action(s) will continue to be executed with the next ones.",
            onclick: () => {
                action.isBlocking = !action.isBlocking;
                AnimationToolBar.update();
                CircularMenu.hide();
            }
        });

       /* const img = ["1F40C.svg", "1F416.svg", "1F406.svg"];
        for(const i of [0, 1, 2]) {
            this.addButtonImage({
                src: `img/icons/${img[i]}`,
                title: `Speed ${i}`,
                onclick: () => { action.speed = i; CircularMenu.hide(); }
            });
        }*/
        
     /*   this.addButtonImage({
            src: "img/icons/26A1.svg",
            title: "Make that action immediate",
            onclick: () => { action.speed = 6; CircularMenu.hide(); }
        });*/

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