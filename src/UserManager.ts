import { UserListComponent } from './UserListComponent';
import { Menu } from "./Menu";
import { OptionManager } from "./OptionManager";
import { Share } from "./share";
import { User } from "./User";

export class UserManager {


    /**
     * 
     * @param userId 
     * @param bool 
     * @description if bool=true, the user can write, otherwise, she cannot.
     */
    static setUserCanWrite(userId: string, bool: boolean): void {
        console.log(`setUserCanWrite(${userId}, ${bool})`);
        UserManager.users[userId].setCanWrite(bool);

        if (userId == UserManager.me.userID) {
            /** toggle the visibility for elements for editing the board */
            const elements = document.getElementsByClassName("edit");
            for (let i = 0; i < elements.length; i++) {
                (<HTMLElement>elements[i]).hidden = !bool;
            }
        }
        UserListComponent.updateGUIUser(userId);
    }


    static me: User = undefined; // the current user
    static users: { [id: string]: User } = {};



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
     * @returns true if the current user is the responsible of the data
     * (minimum of all participants among the root one, minimum in the sense of smallest userid with the order <)
     */
    static isIamResponsibleForData(): boolean {
        let minkey = "zzzzzzzzzzzzzzzz";
        for (const key in UserManager.users) {
            if (UserManager.users[key].isRoot)
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
        UserListComponent.leave(userid);
    }

    /**
     *
     * @param {*} userid
     * @description add a new user of ID userid
     */
    static add(userid: string): void {
        UserManager.users[userid] = new User(false);
        UserManager.users[userid].userID = userid;
        UserListComponent.add(userid);
    }

    /**
     *
     * @param {*} userid
     * @description rename the current user (UserManager.me) as userid
     */
    static setMyUserID(userid: string): void {
        for (const key in UserManager.users) {
            if (UserManager.users[key] == UserManager.me)
                delete UserManager.users[key];
        }

        UserManager.users[userid] = UserManager.me;
        UserManager.me.setUserID(userid);
        UserListComponent.updateGUIUsers();
    }










    /**
     * @returns the number of connected users to the current baord
     */
    static getNumberOfUsers(): number { return Object.keys(UserManager.users).length; }




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
