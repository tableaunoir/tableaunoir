'use strict';

const PORT = 8080;

const https = require('https'); //https library (I can make it work properly)
const WebSocket = require('ws'); //websocket library
const fs = require('fs'); //filesystem
const uuid = require('small-uuid');

class UserManager {
  /**
   * @returns a identifier for a new user
   */
  static generateUserID() {
    if (UserManager.userIDi == undefined)
      UserManager.userIDi = 0;
    UserManager.userIDi++;
    return "u" + UserManager.userIDi;
  }
}



/**
 * 
 * @param {*} msg a message (in the object format)
 * @return a string that can displayed in the console and that represents the message msg
 */
function messageToString(msg) {
  if (msg.type != "fullCanvas" && msg.type != "magnets" && msg.type != "execute")
    return JSON.stringify(msg);
  else if (msg.type == "execute")
    return msg.type + " " + msg.event;
  else
    return msg.type;
}


let lastStr = undefined;
let iLastStr = 0;

function print(str) {
  if (lastStr == str) {
    iLastStr++;
    process.stdout.write(".");
  } else {
    lastStr = str;
    process.stdout.write("\n" + str);
    iLastStr = 1;
  }

}
const tableaunoirs = {};

/**
 * represents a tableaunoir in use
 */
class TableauNoir {

  /**
   * @returns generate an ID for a new tableaunoir
   */
  static generateTableauID() {
    return uuid.create();//"t" + generateID();
  }


  constructor() {
    this.sockets = [];
    this.data = ""; //content of the canvas
    this.magnets = ""; // content of the magnet part
  }

  storeFullCanvas(data) {
    this.data = data;
  }

  /**
   * 
   * @param {*} socket 
   * @description adds the new user socket
   */
  addSocket(socket) {

    //inform the new user socket that the others exist
    this.sockets.forEach(s => {
      socket.send(JSON.stringify({ type: "user", userid: s.userid }))
      print("> " + socket.userid + " " + messageToString({ type: "user", userid: s.userid }));
    });

    this.sockets.push(socket);

    //send to socket its own userid
    print("> " + socket.userid + " " + messageToString({ type: "youruserid", userid: socket.userid }));
    socket.send(JSON.stringify({ type: "youruserid", userid: socket.userid }));

    //send to socket the last canvas stored
    if (this.data != "")
      socket.send(JSON.stringify({ type: "fullCanvas", data: this.data }));

    //inform the others that socket arrives
    this.dispatch({ type: "join", userid: socket.userid }, socket);

    print("users are " + this.sockets.map((s) => s.userid).join(","));
  }

  /**
   * 
   * @param {*} socket 
   * @description removes the user socket
   */
  removeSocket(socket) {
    print(socket.userid + " leaves.");
    this.sockets = this.sockets.filter(s => s !== socket);
    this.dispatch({ type: "leave", userid: socket.userid }, socket); //tells the others that socket leaved
  }


  sendTo(msg) {
    delete msg.socket;

    this.sockets.forEach(s => {
      if (s.userid == msg.to) {
        s.send(JSON.stringify(msg))
        print("  > " + s.userid);
      }
    });

  }


  /**
   * 
   * @param {*} msg 
   * @param {*} exceptSocket 
   * @description sends msg to all except exceptSocket
   */
  dispatch(msg, exceptSocket) {
    delete msg.socket;

    if (this.sockets.length > 1)
      print("dispatch ", messageToString(msg));


    this.sockets.forEach(s => {
      if (s != exceptSocket) {
        s.send(JSON.stringify(msg))
        print("  > " + s.userid);
      }
    });
  }
}




/**
 * @description create a SSL websocket server (does not work yet... issues with the certificate)
 */
function createWebSocketServerSSL() {

  /*
const credentials = {
  key: fs.readFileSync('/etc/ssl/private/tableaunoir.irisa.fr.key'),
  ca: fs.readFileSync('/etc/ssl/private/tableaunoir.irisa.fr.cer'),
  cert: fs.readFileSync('/etc/ssl/private/tableaunoir.irisa.fr.csr')
};
*/


  const credentials = {
    key: fs.readFileSync('/etc/ssl/private/tableaunoir.irisa.fr.key'),
    //ca: fs.readFileSync('/etc/ssl/private/tableaunoir.irisa.fr.cer'),
    //key: fs.readFileSync('private.pem'),
    cert: fs.readFileSync('/etc/ssl/private/tableaunoir.irisa.fr.crt')
  };

  /*
  const credentials = {
    cert: fs.readFileSync('tableaunoir_irisa_fr.pem'),
    key: fs.readFileSync('private.pem'),
  };*/


  const httpsServer = https.createServer(credentials
    , function (request, response) {
      response.writeHead(200);
      response.end("Hello!\n");
    });

  return WebSocket.Server({
    server: httpsServer,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
  });

}



/**
 * create a simple web socket server
 */
function createWebSocketServerNormal() {
  return new WebSocket.Server({
    port: PORT
  });
}

let server = createWebSocketServerNormal();


let sockets = [];

print("Tableaunoir server -- Welcome");

server.on('connection', function (socket) {
  print("New connection!")
  socket.userid = UserManager.generateUserID();
  sockets.push(socket);

  socket.on('message', (msg) => {
    msg = JSON.parse(msg);
    print(socket.userid + ": " + messageToString(msg));
    msg.socket = socket;
    treatReceivedMessageFromClient(msg);
  });

  socket.on('close', function () {
    sockets = sockets.filter(s => s !== socket);

    if (socket.id != undefined && tableaunoirs[socket.id] != undefined)
      tableaunoirs[socket.id].removeSocket(socket);
  });
});


/**
 * 
 * @param {*} msg a message in object form, received from one client
 * @description treats the msg
 */
function treatReceivedMessageFromClient(msg) {
  let tableaunoirID = msg.id;

  switch (msg.type) {
    case "share":
      tableaunoirID = TableauNoir.generateTableauID();
      tableaunoirs[tableaunoirID] = new TableauNoir();
      msg.socket.id = tableaunoirID;
      tableaunoirs[tableaunoirID].addSocket(msg.socket);
      msg.socket.send(JSON.stringify({ type: "id", id: tableaunoirID }));
      break;

    case "join":
      if (tableaunoirs[tableaunoirID] == undefined) {
        print("automatic creation of a tableaunoir of id " + msg.id)
        tableaunoirs[tableaunoirID] = new TableauNoir();
      }
      msg.socket.id = tableaunoirID;
      tableaunoirs[tableaunoirID].addSocket(msg.socket);
      break;

    case "fullCanvas":
      if (tableaunoirID == undefined)
        print("error: fullCanvas message and id undefined");
      else
        tableaunoirs[tableaunoirID].storeFullCanvas(msg.data);

      if (msg.to)
        tableaunoirs[tableaunoirID].sendTo(msg);
      else
        tableaunoirs[tableaunoirID].dispatch(msg, msg.socket);
      break;


    case "magnets":
      if (tableaunoirID == undefined)
        print("error: magnets message and id undefined");

      if (msg.to)
        tableaunoirs[tableaunoirID].sendTo(msg);
      else
        tableaunoirs[tableaunoirID].dispatch(msg, msg.socket);

      break;

    //by default other msgs are dispatched
    default:
      tableaunoirs[tableaunoirID].dispatch(msg, msg.socket);
  }




}