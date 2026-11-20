import { Share } from "./share";
import { UserManager } from "./UserManager";


/**
 * this class handles the user list in the menu (GUI)
 */
export class UserListComponent {

    /**
     * @description filenames of the avatars of the userss
     */
    private static readonly usersImageFileNames = ['1F9D1-200D-1F384.svg',
        '1F9D9.svg',
        '1F9DA-200D-2640-FE0F.svg',
        '1F9DD.svg'];


    /**
    * @description update the GUI
    */
    public static updateGUIUsers(): void {
        document.getElementById("userList").innerHTML = "";

        for (const userid in UserManager.users)
            document.getElementById("userList").appendChild(UserListComponent.createUserHTMLElement(userid));

        UserListComponent.updateNumberOfUsers();

    }


    /**
     * @description update the widget saying the number of users 
     */
    public static updateNumberOfUsers(): void {
        if (Share.isShared())
            document.getElementById("numberOfUsers").innerHTML = UserListComponent.getUserImage("u0").outerHTML + " × " + UserManager.getNumberOfUsers();
    }


    /**
     * 
     * @param userid 
     * @description update the information of user of id userid
     */
    public static updateGUIUser(userid: string): void {
        if (UserListComponent.getUserHTMLElement(userid))
            document.getElementById("userList").replaceChild(UserListComponent.createUserHTMLElement(userid), UserListComponent.getUserHTMLElement(userid))
        else
            UserListComponent.updateGUIUsers();
    }


    /**
     * 
     * @param userid 
     * @description update the list in the GUI with newuser of id userid
     */
    public static add(userid: string): void {
        document.getElementById("userList").appendChild(UserListComponent.createUserHTMLElement(userid));
        UserListComponent.updateNumberOfUsers();
    }


    /**
     * 
     * @param userid 
     * @description updates the GUI that user of id userid just leaved
     */
    public static leave(userid: string): void {
        UserListComponent.getUserHTMLElement(userid).remove();
        UserListComponent.updateNumberOfUsers();
    }


    /**
     * 
     * @param userid (a userid is of the form "uXXX" where XXX is an integer)
     * @returns the image/avatar of the user, depending on the integer XXX
     */
    public static getUserImage(userid: string): HTMLImageElement {
        const img = new Image();
        let i = parseInt(userid.substr(1));
        if (isNaN(i)) i = 0;
        img.draggable = false;
        img.src = "img/users/" + UserListComponent.usersImageFileNames[i % UserListComponent.usersImageFileNames.length];
        img.classList.add("userImage");
        return img;
    }

    /**
     * @returns an image of a crown for a root user
     */
    private static createRootImage(): HTMLImageElement {
        const img = new Image();
        img.src = "img/users/1F451.svg";
        img.title = 'user with full privileges';
        img.style.width = "32px";
        return img;
    }





    /**
     * 
     * @param userid 
     * @return the widget for the writing permissions of user of id userid
     */
    private static createCanWriteImage(userid: string): HTMLImageElement {
        const img = new Image();

        img.src = UserManager.users[userid].canWrite ? "img/users/270F.svg" : "img/users/1F6AB.svg";
        img.title = 'writing permission';
        img.style.width = "32px";

        if (UserManager.me.isRoot && (!UserManager.users[userid].isRoot || userid == UserManager.me.userID)) {
            img.style.cursor = "pointer";
            img.onclick = () => { Share.execute("setUserCanWrite", [userid, !UserManager.users[userid].canWrite]) };
        }

        return img;
    }


    /**
     * 
     * @param userID 
     * @returns the element corresponding to user of id userid (if that element is already in the GUI)
     */
    private static getUserHTMLElement(userID: string): HTMLElement {
        return document.getElementById("userElement" + userID);
    }


    /**
     * 
     * @param userID
     * @description creates an element corresponding to user of id userid
     * @returns the created element
     */
    private static createUserHTMLElement(userID: string): HTMLElement {
        const userDOM = document.createElement("div");
        userDOM.id = "userElement" + userID;
        userDOM.classList.add("user");

        userDOM.appendChild(UserListComponent.getUserImage(userID));

        const userNameDOM = document.createElement("span");
        userNameDOM.innerHTML = UserManager.users[userID].name;
        userDOM.appendChild(userNameDOM);

        if (UserManager.users[userID].isRoot)
            userDOM.appendChild(UserListComponent.createRootImage());

        userDOM.appendChild(this.createCanWriteImage(userID));

        if (userID == UserManager.me.userID)
            userDOM.classList.add("me");

        return userDOM;
    }
}