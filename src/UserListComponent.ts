import { Share } from "./share";
import { UserManager } from "./UserManager";

export class UserListComponent {



    /**
    * @description update the GUI
    */
    static updateGUIUsers(): void {
        document.getElementById("userList").innerHTML = "";

        for (const userid in UserManager.users)
            document.getElementById("userList").appendChild(UserListComponent.createUserHTMLElement(userid));

        UserListComponent.updateNumberOfUsers();

    }



    static updateNumberOfUsers(): void {
        if (Share.isShared())
            document.getElementById("numberOfUsers").innerHTML = UserListComponent.getUserImage("u0").outerHTML + " × " + UserManager.getNumberOfUsers();
    }


    static updateGUIUser(userid: string): void {
        if (UserListComponent.getUserHTMLElement(userid))
            document.getElementById("userList").replaceChild(UserListComponent.createUserHTMLElement(userid), UserListComponent.getUserHTMLElement(userid))
        else
            UserListComponent.updateGUIUsers();
    }



    static add(userid: string): void {
        document.getElementById("userList").appendChild(UserListComponent.createUserHTMLElement(userid));
        UserListComponent.updateNumberOfUsers();
    }


    static leave(userid: string): void {
        UserListComponent.getUserHTMLElement(userid).remove();
        UserListComponent.updateNumberOfUsers();
    }

    static getUserImage(userid: string): HTMLImageElement {
        const img = new Image();
        const i = parseInt(userid.substr(1));
        img.src = "img/users/" + UserManager.usersImageFileNames[i % UserManager.usersImageFileNames.length];
        img.classList.add("userImage");
        return img;
    }


    static getRootImage(userid: string): HTMLImageElement {
        const img = new Image();
        img.src = "img/users/1F451.svg";
        img.title = 'user with full privileges';
        img.style.width = "32px";
        return img;
    }






    static getCanWriteImage(userid: string): HTMLImageElement {
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



    static getUserHTMLElement(userID: string): HTMLElement {
        return document.getElementById("userElement" + userID);
    }



    static createUserHTMLElement(userID: string): HTMLElement {
        const userDOM = document.createElement("div");
        userDOM.id = "userElement" + userID;
        userDOM.classList.add("user");

        userDOM.appendChild(UserListComponent.getUserImage(userID));


        const userNameDOM = document.createElement("span");
        userNameDOM.innerHTML = UserManager.users[userID].name;
        userDOM.appendChild(userNameDOM);


        if (UserManager.users[userID].isRoot)
            userDOM.appendChild(UserListComponent.getRootImage(userID));

        userDOM.appendChild(this.getCanWriteImage(userID));

        if (userID == UserManager.me.userID)
            userDOM.classList.add("me");

        return userDOM;
    }
}