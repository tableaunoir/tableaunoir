import { MagnetManager } from './magnetManager';
import { Share } from './share';
import { ToolEllipse } from './ToolEllipse';
import { ToolRectangle } from './ToolRectangle';
import { UserManager } from './UserManager';
import { CircularMenu } from './CircularMenu';

export class ToolMenu extends CircularMenu {
    constructor() {
        super();

        let buttonMagnetize = new Image();
        buttonMagnetize.src = "img/icons/magnetize.svg";
        buttonMagnetize.title = "Magnetize the last drawn shape (Ctrl + X)";


        let buttonFreeDraw = new Image();
        buttonFreeDraw.src = "img/icons/free.svg";
        buttonFreeDraw.title = "Draw and write freely";

        let buttonLine = new Image();
        buttonLine.src = "img/icons/line.svg";
        buttonLine.title = "Draw a line";

        let buttonRectangle = new Image();
        buttonRectangle.src = "img/icons/25AD.svg";
        buttonRectangle.title = "Draw a rectangle";

        let buttonEllipseByBorder = new Image();
        buttonEllipseByBorder.src = "img/icons/26AA.svg";
        buttonEllipseByBorder.title = "Draw an ellipse (draw its bounding box)";

        let buttonEllipseByCenter = new Image();
        buttonEllipseByCenter.src = "img/icons/26AAcenter.svg";
        buttonEllipseByCenter.title = "Draw an ellipse (center then radius)";

        this.addButton(buttonMagnetize);
        this.addButton(buttonFreeDraw);
        this.addButton(buttonLine);
        this.addButton(buttonRectangle);
        this.addButton(buttonEllipseByBorder);
        this.addButton(buttonEllipseByCenter);


        buttonMagnetize.onclick = () => {
            if (UserManager.me.tool.lastDelineation.containsPolygonToMagnetize())
                UserManager.me.tool.lastDelineation.cutAndMagnetize();
            CircularMenu.hide();
        };


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

        buttonEllipseByBorder.onclick = () => {
            Share.execute("switchEllipseByBorder", [UserManager.me.userID]);
            CircularMenu.hide();
        };

        buttonEllipseByCenter.onclick = () => {
            Share.execute("switchEllipseByCenter", [UserManager.me.userID]);
            CircularMenu.hide();
        };

        this.layout();
    }



}