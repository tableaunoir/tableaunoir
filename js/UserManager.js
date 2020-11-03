

class UserManager {

    static me = undefined;
    static users = {};


    /**
     * initialisation: creation of myself :)
     */
    static init() {
        UserManager.me = new User(true);
        UserManager.users['root'] = UserManager.me;
        UserManager.me.setUserID('root');
    }



    /**
     * @returns true if the userID of the current user is the minimum of all participants
     */
    static isSmallestUserID() {
        let minkey = "zzzzzzzzzzzzzzzz";
        for (let key in UserManager.users) {
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
    static leave(userid) {
        UserManager.users[userid].destroy();
        delete UserManager.users[userid];
        UserManager.updateUsers();
    }

    /**
     * 
     * @param {*} userid 
     * @description add a new user of ID userid
     */
    static add(userid) {
        UserManager.users[userid] = new User();
        UserManager.updateUsers();
    }

    /**
     * 
     * @param {*} userid 
     * @description renaUserManager.me the current user (UserManager.me) as userid
     */
    static setMyUserID(userid) {
        for (let key in UserManager.users) {
            if (UserManager.users[key] == UserManager.me)
                delete UserManager.users[key];
        }

        UserManager.users[userid] = UserManager.me;
        UserManager.me.setUserID(userid);
        UserManager.updateUsers();
    }


    static userIdToDom(userID) {
        let userDOM = document.createElement("span");
        userDOM.innerHTML = userID;
        userDOM.classList.add("user");
        return userDOM;
    }

    /**
     * @description update the GUI
     */
    static updateUsers() {
        document.getElementById("users").innerHTML = "";

        let i = 0;
        for (var key in UserManager.users) {
            let el = UserManager.userIdToDom(key);
            if (key == UserManager.me.userID)
                el.classList.add("me");
            document.getElementById("users").appendChild(el);
            i++;
        }



    }

}