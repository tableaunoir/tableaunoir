import { Share } from './share';
import { UserManager } from './UserManager';
import { CircularMenu } from './CircularMenu';

export class ToolMenu extends CircularMenu {
    constructor() {
        super();

        this.addButtonImage({
            src: "img/icons/magnetize.svg",
            title: "Magnetize the last drawn shape (Ctrl + X)",
            onclick: () => {
                if (!UserManager.me.isDelineation)
                    return;
                if (UserManager.me.lastDelineation.containsPolygonToMagnetize())
                    UserManager.me.lastDelineation.magnetize({cut: true, removeContour: true});
                CircularMenu.hide();
            }
        });

        this.addButtonImage({
            src: "img/icons/free.svg",
            title: "Draw and write freely",
            onclick: () => {
                Share.execute("switchChalk", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });

        this.addButtonImage({
            src: "img/icons/line.svg",
            title: "Draw a line",
            onclick: () => {
                Share.execute("switchLine", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });


        this.addButtonImage({
            src: "img/icons/25AD.svg",
            title: "Draw a rectangle",
            onclick: () => {
                Share.execute("switchRectangle", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });

        this.addButtonImage({
            src: "img/icons/26AA.svg",
            title: "Draw an ellipse (via its bounding box)",
            onclick: () => {
                Share.execute("switchEllipseByBorder", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });

        this.addButtonImage({
            src: "img/icons/26AAcenter.svg",
            title: "Draw an ellipse (center then radius)",
            onclick: () => {
                Share.execute("switchEllipseByCenter", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });

        this.addButtonImage({
            src: "img/icons/arc.svg",
            title: "Draw arcs (with a compass)",
            onclick: () => {
                Share.execute("switchArc", [UserManager.me.userID]);
                CircularMenu.hide();
            }
        });

        this.layout();
    }



}