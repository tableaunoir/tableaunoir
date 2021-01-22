import { ActionSerialized } from './ActionSerialized';
/**
* interface for messages sent from the client to the server and server to the client
*/

export interface ShareMessage {
    type: "share" | "askprivilege" | "id" | "youruserid" | "user" | "wait" | "ready" | "root" | "accessdenied" | "join" | "leave" | "fullCanvas" | "magnets" | "magnetChanged" | "newmagnet" | "execute" | "actions" | "svg"; 
    /** type of the message (for instance, there is a new user, or here is the content of the canvas etc.)

    //    client -------------------> server

    - share is a message sent to the server for asking to share the board! password then contains the password to lock the board
    - askprivilege with a given password proposal in password.

    TODO

    // server ---------------------------> client

    - id: meaning that the id of the board is id!
    - youruserid: the client receives its user id userid
    - accessdenied: access denied. You typed a wrong password



    // client -------------server---------------> client

    - user: there is a user of id userid
    - wait: please wait, there are some data that you need to have before starting drawing
    - ready: ok! you are ready now to draw!
    - root: you are root!
    - join: a new user joins!
    - leave: a user leaved the board, bybye!
    - fullCanvas: here is the image of the board
    - magnets: here are the magnets
    - magnetChanged: the magnet of ID magnetid has changed
    - newmagnet: there is a new magnet! Its ID is magnetid
    - execute: please, execute the event event with the parameters params. The event are defined in the class SharedEvent
    **/
   
    id?: string; // id of the board
    userid?: string;
    data?: string;
    magnets?: string;
    magnetid?: string;

    actions?: ActionSerialized[];
    t?: number;

    event?: string;
    params?: [string];

    password?: string;

    to?: string;
}


/**
 * parameters that an be sent to the server and/or received
 */
export type Parameter = boolean | number | string | PointerEvent | { x: number, y: number }[];
