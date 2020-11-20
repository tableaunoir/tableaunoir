import { OptionManager } from "./OptionManager";
import { Share } from "./share";
import { User } from "./User";

export class UserManager {

    static me: User = undefined; // the current user
    static users: {} = {};

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
                Share.execute("setUserName", [UserManager.me.userID, userName]);
            }
        });
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




    static userIdToDom(userID: string): HTMLImageElement {

        const userDOM = UserManager.getUserImage(userID);
        userDOM.classList.add("user");
        userDOM.title = "user " + userID;
        return userDOM;
    }



    /**
     * @returns the number of connected users to the current baord
     */
    static getNumberOfUsers(): number {
        return Object.keys(UserManager.users).length;
    }

    /**
     * @description update the GUI
     */
    static updateGUIUsers(): void {
        document.getElementById("users").innerHTML = "";

        /**let i = 0;
        for (var key in UserManager.users) {
            let el = UserManager.userIdToDom(key);
            if (key == UserManager.me.userID)
                el.classList.add("me");
            document.getElementById("users").appendChild(el);
            i++;
        }*/


        document.getElementById("users").innerHTML = UserManager.getUserImage("u0").outerHTML + " × " + UserManager.getNumberOfUsers();

    }

}
