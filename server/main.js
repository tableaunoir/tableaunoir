const WebSocket = require('ws');
const generateID = require("uuid/v4")

const tableaunoirs = {};

class TableauNoir {
  constructor() {
    this.sockets = [];
  }

  addSocket(socket) {
    this.sockets.push(socket);
  }

  dispatch(msg, exceptSocket) {
    this.sockets.forEach(s => { if (s != exceptSocket) s.send(msg) });
  }
}

const server = new WebSocket.Server({
  port: 443
});

let sockets = [];

console.log("Tableaunoir server -- Welcome");

server.on('connection', function (socket) {
  console.log("New connection!")
  sockets.push(socket);

  socket.on('message', (msg) => {
    console.log(msg);
    msg = JSON.parse(msg);
    msg.socket = socket;
    treatReceivedMessageFromClient(msg);
  });

  socket.on('close', function () {
    sockets = sockets.filter(s => s !== socket);
  });
});



function treatReceivedMessageFromClient(msg) {
  let id = msg.id;
  switch (msg.type) {
    case "share":
      id = generateID();
      tableaunoirs[id] = new TableauNoir();
      tableaunoirs[id].addSocket(msg.socket);
      msg.socket.send(JSON.stringify({ type: "id", id: id }));
      break;

    case "join":
      if (tableaunoirs[id] == undefined) {
        console.log("there is no tableaunoir of id " + id);
        return;
      }
      tableaunoirs[id].addSocket(msg.socket);
      break;
  }

  tableaunoirs[id].dispatch(msg, socket);


}