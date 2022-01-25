import { Share } from './share';
import { UserManager } from './UserManager';
import { CircularMenu } from './CircularMenu';


/**
 * menu for actions
 */
export class ActionTimeLineMenu extends CircularMenu {

    constructor() {
        super(true);
        this.radius = 40;
        /*  this.addButtonImage({
              src: "img/icons/parallel.svg",
              title: "Execute the action in parallel or not. Make that we do not for the action(s) to finish. Action(s) will continue to be executed with the next ones.",
              onclick: () => {
                  const a = BoardManager.timeline.actions[t];
                  a.isBlocking = !a.isBlocking;
                  AnimationToolBar.update();
                  CircularMenu.hide();
              }
          });*/

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
               title: "Make the actions immediate",
               onclick: () => { action.speed = 6; CircularMenu.hide(); }
           });*/


        /**
         * merge
         */
        this.addButtonImage({
            src: "img/icons/2194.svg",
            title: "Merge this slde with the next one",
            onclick: () => {
                Share.execute("mergeSlide", [UserManager.me.userID])
                CircularMenu.hide();
            }
        });

        /**
         * slide and clear
         */
        this.addButtonImage({
            src: "img/icons/1F5BCclear.svg",
            title: "Add a new clear slide after this one",
            onclick: () => {
                Share.execute("newSlideAndClear", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });

        /**
         * new slide (without clearning the board)
         */
        this.addButtonImage({
            src: "img/icons/1F5BC.svg",
            title: "Add a new slide after this one",
            onclick: () => {
                Share.execute("newSlide", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });


        this.layout();
    }

}