'use strict';

// For the server to listen on a regular internet domain socket, set SOCKET_ADDR
// to a length-2 list of the form [addr, port], for instance:
const SOCKET_ADDR = ['localhost', 8080]
// If you prefer Unix domain sockets, set SOCKET_ADDR to the path of the socket,
// for instance:
// const SOCKET_ADDR = '/run/tableaunoir.sock';

const http = require('http');
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
 * Create a web socket server at a Unix socket.
 */
function createWebSocketServerUnix(path) {
  const httpServer = http.createServer();
  const wsServer = new WebSocket.Server({ server: httpServer });

  // The socket must be world readable and world writable.
  httpServer.listen(path, () => {
    fs.chmod(path, 0o777, (err) => { if (err) throw err; });
  });

  // Remove the socket before exiting.
  process.on('SIGINT', () => {
    fs.unlink(path, (err) => { if (err) throw err; });
    process.exit();
  });

  return wsServer;
}

/**
 * Create a simple web socket server at an internet domain socket.
 */
function createWebSocketServerInet(addr, port) {
  const httpServer = http.createServer();
  const wsServer = new WebSocket.Server({ server: httpServer });
  httpServer.listen(port, addr);
  return wsServer;
}

/**
 * Create a simple web socket at the address specified in SOCKET_ADDR.
 */
function createWebSocketServer() {
  if (typeof SOCKET_ADDR === 'string') {
    // Assuming Unix socket
    return createWebSocketServerUnix(SOCKET_ADDR);
  } else {
    // Assuming regular socket
    const [addr, port] = SOCKET_ADDR;
    return createWebSocketServerInet(addr, port);
  }
}

const server = createWebSocketServer();

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
