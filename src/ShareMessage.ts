/**
* interface for messages sent from the client to the server and server to the client
*/

export interface ShareMessage {
    type: string;
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
export type Parameter = boolean|number|string|PointerEvent|{x:number, y:number}[];
