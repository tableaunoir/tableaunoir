const WebSocket = require('ws');
const generateID = require("uuid/v4")

function generateTableauID() {
  return "t" + generateID();
}


function generateUserID() {
  return "u" + generateID();
}


const tableaunoirs = {};

class TableauNoir {
  constructor() {
    this.sockets = [];
  }

  addSocket(socket) {

    //inform the new user socket that the others exist
    this.sockets.forEach(s => {
      socket.send(JSON.stringify({ type: "join", userid: s.userid }))
    });

    this.sockets.push(socket);

    //send to socket its own userid
    socket.send(JSON.stringify({ type: "userid", userid: socket.userid }));

    //inform the others that socket arrives
    this.dispatch({ type: "join", userid: socket.userid }, socket);
  }

  removeSocket(socket) {
    this.sockets = this.sockets.filter(s => s !== socket);
    this.dispatch({ type: "leave", userid: socket.userid }, socket);
  }

  dispatch(msg, exceptSocket) {
    delete msg.socket;

    if (msg.type != "fullCanvas" && msg.type != "execute")
      console.log("send ", msg);
    else
      console.log("send ", msg.type);
    this.sockets.forEach(s => {
      if (s != exceptSocket) {
        s.send(JSON.stringify(msg))
        console.log("   to user " + s.userid);
      }
    });
  }
}

const server = new WebSocket.Server({
  port: 443
});

let sockets = [];

console.log("Tableaunoir server -- Welcome");

server.on('connection', function (socket) {
  console.log("New connection!")
  socket.userid = generateUserID();
  sockets.push(socket);

  socket.on('message', (msg) => {
    console.log(msg);
    msg = JSON.parse(msg);
    msg.socket = socket;
    treatReceivedMessageFromClient(msg);
  });

  socket.on('close', function () {
    sockets = sockets.filter(s => s !== socket);
    tableaunoirs[socket.id].removeSocket(socket);
  });
});



function treatReceivedMessageFromClient(msg) {
  let id = msg.id;

  if (msg.type != "share")
    if (tableaunoirs[id] == undefined) {
      console.log("automatic creation of a tableaunoir of id " + msg.id)
      tableaunoirs[id] = new TableauNoir();
      msg.socket.userid = "root";
      tableaunoirs[id].addSocket(msg.socket);
    }

  switch (msg.type) {
    case "share":
      id = generateTableauID();
      tableaunoirs[id] = new TableauNoir();
      tableaunoirs[id].addSocket(msg.socket);
      msg.socket.id = id;
      msg.socket.userid = "root";
      msg.socket.send(JSON.stringify({ type: "id", id: id }));
      break;

    case "join":
      if (tableaunoirs[id] == undefined) {
        console.log("there is no tableaunoir of id " + id);
        return;
      }
      msg.socket.id = id;
      tableaunoirs[id].addSocket(msg.socket);
      break;

    default:
      tableaunoirs[id].dispatch(msg, msg.socket);
  }




}