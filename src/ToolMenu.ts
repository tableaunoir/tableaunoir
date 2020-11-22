import { Share } from './share';
import { ToolEllipse } from './ToolEllipse';
import { ToolRectangle } from './ToolRectangle';
import { UserManager } from './UserManager';
import { CircularMenu } from './CircularMenu';

export class ToolMenu extends CircularMenu {
    constructor() {
        super();
        let buttonFreeDraw = new Image();
        buttonFreeDraw.src = "img/icons/free.svg";
        buttonFreeDraw.title = "Draw and write freely";

        let buttonLine = new Image();
        buttonLine.src = "img/icons/line.svg";
        buttonLine.title = "Draw a line";

        let buttonRectangle = new Image();
        buttonRectangle.src = "img/icons/25AD.svg";
        buttonRectangle.title = "Draw a rectangle";

        let buttonEllipse = new Image();
        buttonEllipse.src = "img/icons/26AA.svg";
        buttonEllipse.title = "Draw an ellipse";


        this.addButton(buttonFreeDraw);
        this.addButton(buttonLine);
        this.addButton(buttonRectangle);
        this.addButton(buttonEllipse);

        buttonFreeDraw.onclick = () => {
            Share.execute("switchChalk", [UserManager.me.userID]);
            CircularMenu.hide();
        };

        buttonLine.onclick = () => {
            Share.execute("switchLine", [UserManager.me.userID]);
            CircularMenu.hide();
        };

        buttonRectangle.onclick = () => {
            Share.execute("switchRectangle", [UserManager.me.userID]);
            CircularMenu.hide();
        };

        buttonEllipse.onclick = () => {
            Share.execute("switchEllipse", [UserManager.me.userID]);
            CircularMenu.hide();
        };


        this.layout();
    }



}