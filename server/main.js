'use strict';

/**********************************************************************************
 * Different possibilities for creating the socket
 */

//For a normal server listening on a given port:

const SOCKET_ADDR = { port: 8080 };


// For the server to listen on a regular internet domain socket, set SOCKET_ADDR
// to a record of the form { addr: addr, port: port }, for instance:

//const SOCKET_ADDR = { addr: 'localhost', port: 8080 };





// If you prefer Unix domain sockets, set SOCKET_ADDR to a record containing the
// path of the socket, for instance:

// const SOCKET_ADDR = { unix: '/run/tableaunoir.sock' };


/********************************************************************************* */


const http = require('http');
const WebSocket = require('ws'); //websocket library
const fs = require('fs'); //filesystem
const uuid = require('small-uuid'); //for generating small IDs




/**
 * Create a web socket server at a Unix socket.
 */
function createWebSocketServerUnix(path) {
  console.log("unix server");
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
  console.log("Inet server");
  const httpServer = http.createServer();
  const wsServer = new WebSocket.Server({ server: httpServer });
  httpServer.listen(port, addr);
  return wsServer;
}




function createWebSocketServerNormal(port) {
  console.log(`normal server on port ${port}`);
  return new WebSocket.Server({
    port: port
  });
}



/**
 * Create a simple web socket at the address specified in SOCKET_ADDR.
 */
function createWebSocketServer(SOCKET_ADDR) {
  console.log("creation of the socket server")
  if (SOCKET_ADDR.hasOwnProperty('addr') && SOCKET_ADDR.hasOwnProperty('port')) {
    return createWebSocketServerInet(SOCKET_ADDR.addr, SOCKET_ADDR.port);
  }
  else if (SOCKET_ADDR.hasOwnProperty('port')) {
    return createWebSocketServerNormal(SOCKET_ADDR.port)
  }
  else if (SOCKET_ADDR.hasOwnProperty('unix')) {
    return createWebSocketServerUnix(SOCKET_ADDR.unix);
  }
  throw 'Invalid SOCKET_ADDR';
}

const server = createWebSocketServer(SOCKET_ADDR);














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

/**
 * 
 * @param {*} str 
 * @description write str on the console, but write a "." if it was already printed before
 */
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


print("Tableaunoir server is ready -- Welcome");




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
    this.sockets = [];//users of that board
    this.rootSockets = []; //"teachers" (privileged users) //this.rootSockets is a subset of this.sockets
    this.data = ""; //content of the canvas
    this.magnets = ""; // content of the magnet part
    this.password = "";
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

    //add to the socket
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



  setRoot(socket) {
    this.rootSockets.push(socket);
  }


  setPassWord(password) {
    this.password = password;
  }


  isPassWordCorrect(candidate) {
    return this.password == candidate;
  }


  isProtected() {
    return this.password != "";
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


  /**
   * 
   * @param {*} msg 
   * @description send the msg to the user given in msg.to
   */
  sendTo(msg) {
    delete msg.socket;

    this.sockets.forEach(s => {
      if (s.userid == msg.to) {
        s.send(JSON.stringify(msg))
        print(messageToString(msg) + "  > " + s.userid);
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


let sockets = [];



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
      tableaunoirs[tableaunoirID].setRoot(msg.socket);
      tableaunoirs[tableaunoirID].setPassWord(msg.password);

      tableaunoirs[tableaunoirID].sendTo({ type: "id", id: tableaunoirID, to: msg.socket.userid });
      //msg.socket.send(JSON.stringify({ type: "id", id: tableaunoirID }));
      break;

    case "join":
      if (tableaunoirs[tableaunoirID] == undefined) {
        print("automatic creation of a tableaunoir of id " + msg.id)
        tableaunoirs[tableaunoirID] = new TableauNoir();
      }
      msg.socket.id = tableaunoirID;
      tableaunoirs[tableaunoirID].addSocket(msg.socket);

      if (!tableaunoirs[tableaunoirID].isProtected())
        tableaunoirs[tableaunoirID].sendTo({ type: "root", to: msg.socket.userid });

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

    case "askprivilege":
      if (tableaunoirs[tableaunoirID].isPassWordCorrect(msg.password)) {
        tableaunoirs[tableaunoirID].setRoot(msg.socket);
        tableaunoirs[tableaunoirID].sendTo({ type: "root", to: msg.socket.userid });
      }
      else {
        tableaunoirs[tableaunoirID].sendTo({ type: "accessdenied", to: msg.socket.userid });
      }
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
