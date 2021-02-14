import { Menu } from "./Menu";
import { OptionManager } from "./OptionManager";
import { Share } from "./share";
import { User } from "./User";

export class UserManager {
    static setUserCanWrite(userId: string, bool: boolean): void {
        UserManager.users[userId].setCanWrite(bool);

        if (userId == UserManager.me.userID) {
            /** toggle the visibility for elements for editing the board */
            const elements = document.getElementsByClassName("edit");
            for (let i = 0; i < elements.length; i++) {
                (<HTMLElement>elements[i]).hidden = !bool;
            }
        }

        UserManager.updateGUIUsers();
    }


    static me: User = undefined; // the current user
    static users: { [id: string]: User } = {};

    static readonly usersImageFileNames = ['1F9D1-200D-1F384.svg', '1F9D9.svg', '1F9DA-200D-2640-FE0F.svg', '1F9DD.svg'];


    /**
     * initialisation: creation of myself :)
     */
    static init(): void {
        UserManager.me = new User(true);
        UserManager.users['root'] = UserManager.me;
        UserManager.me.setUserID('root');

        OptionManager.string({
            name: "userName",
            defaultValue: "me",
            onChange: (userName) => {
                //the timeout should be removed at some point
                setTimeout(() => Share.execute("setUserName", [UserManager.me.userID, userName]), 1000);
            }
        });

        document.getElementById("numberOfUsers").onclick = () => { Menu.show(); Menu.openPageShare(); }
    }



    /**
     * @returns true if the userID of the current user is the minimum of all participants
     */
    static isSmallestUserID(): boolean {
        let minkey = "zzzzzzzzzzzzzzzz";
        for (const key in UserManager.users) {
            if (key < minkey)
                minkey = key;
        }
        return (UserManager.me.userID == minkey);
    }

    /**
     *
     * @param {*} userid
     * @description userid leaves
     */
    static leave(userid: string): void {
        UserManager.users[userid].destroy();
        delete UserManager.users[userid];
        UserManager.updateGUIUsers();
    }

    /**
     *
     * @param {*} userid
     * @description add a new user of ID userid
     */
    static add(userid: string): void {
        UserManager.users[userid] = new User(false);
        UserManager.updateGUIUsers();
    }

    /**
     *
     * @param {*} userid
     * @description renaUserManager.me the current user (UserManager.me) as userid
     */
    static setMyUserID(userid: string): void {
        for (const key in UserManager.users) {
            if (UserManager.users[key] == UserManager.me)
                delete UserManager.users[key];
        }

        UserManager.users[userid] = UserManager.me;
        UserManager.me.setUserID(userid);
        UserManager.updateGUIUsers();
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

        if (UserManager.me.isRoot)
            img.onclick = () => { Share.execute("setUserCanWrite", [userid, !UserManager.users[userid].canWrite]) };

        return img;
    }


    static userIdToDom(userID: string): HTMLElement {
        const userDOM = document.createElement("div");
        userDOM.classList.add("user");



        userDOM.appendChild(UserManager.getUserImage(userID));


        const userNameDOM = document.createElement("span");
        userNameDOM.innerHTML = UserManager.users[userID].name;
        userDOM.appendChild(userNameDOM);


        if (UserManager.users[userID].isRoot)
            userDOM.appendChild(UserManager.getRootImage(userID));

        userDOM.appendChild(this.getCanWriteImage(userID));

        

        return userDOM;
    }



    /**
     * @returns the number of connected users to the current baord
     */
    static getNumberOfUsers(): number { return Object.keys(UserManager.users).length; }

    /**
     * @description update the GUI
     */
    static updateGUIUsers(): void {
        document.getElementById("userList").innerHTML = "";

        for (const key in UserManager.users) {
            const el = UserManager.userIdToDom(key);
            if (key == UserManager.me.userID)
                el.classList.add("me");
            document.getElementById("userList").appendChild(el);
        }

        if (Share.isShared())
            document.getElementById("numberOfUsers").innerHTML = UserManager.getUserImage("u0").outerHTML + " × " + UserManager.getNumberOfUsers();

    }


    /**
     * @description set the cursor position of all users (except me)
     */
    static setSymbolCursorPosition(): void {
        for (const userid in UserManager.users) {
            const user = UserManager.users[userid];
            if (user != UserManager.me)
                user.setSymbolCursorPosition();
        }
    }
}
