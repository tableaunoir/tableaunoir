/**
* interface for messages sent from the client to the server and server to the client
*/

export interface ShareMessage {
    type: "share" | "askprivilege" | "id" | "youruserid" | "user" | "ready" | "root" | "accessdenied" | "join" | "leave" | "fullCanvas" | "magnets" | "magnetChanged" | "newmagnet" | "execute"; 
    /** type of the message (for instance, there is a new user, or here is the content of the canvas etc.)

    //    client -------------------> server

    - share is a message sent to the server for asking to share the board! password then contains the password to lock the board
    - askprivilege with a given password proposal in password.

    TODO

    // server ---------------------------> client

    - id: meaning that the id of the board is id!
    - youruserid: the client receives its user id userid




    // client -------------server---------------> client



    
    **/
    id?: string; // id of the board
    userid?: string;
    data?: string;
    magnets?: string;
    magnetid?: string;

    event?: string;
    params?: [string];

    password?: string;

    to?: string;
}


/**
 * parameters that an be sent to the server and/or received
 */
export type Parameter = boolean | number | string | PointerEvent | { x: number, y: number }[];
