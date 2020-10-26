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

  dispatch(msg) {
    this.sockets.forEach(s => s.send(msg));
  }
}

const server = new WebSocket.Server({
  port: 443
});

let sockets = [];

server.on('connection', function (socket) {
  sockets.push(socket);

  socket.on('message', function (msg) {
    console.log(msg);
    if (msg == "share") {
      let id = generateID();
      tableaunoirs[id] = new TableauNoir();
      tableaunoirs[id].addSocket(socket);
      socket.send(JSON.stringify({ type: "id", id: id }));
    }
  });

  socket.on('close', function () {
    sockets = sockets.filter(s => s !== socket);
  });
});
