'use strict';

const https = require('https');
const WebSocket = require('ws');
const fs = require('fs');
//const generateID = require("uuid/v4")
const uuid = require('small-uuid');


function generateTableauID() {
  return uuid.create();//"t" + generateID();
}

let userIDi = 0;

function generateUserID() {
  userIDi++;
  return "u" + userIDi;

}




function messageToString(msg) {
  if (msg.type != "fullCanvas" && msg.type != "execute")
    return JSON.stringify(msg);
  else
    return msg.type;
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
      console.log("send to " + socket.userid + " " + messageToString({ type: "join", userid: s.userid }));
    });

    this.sockets.push(socket);

    //send to socket its own userid
    console.log("send to " + socket.userid + " " + messageToString({ type: "userid", userid: socket.userid }));
    socket.send(JSON.stringify({ type: "userid", userid: socket.userid }));

    //inform the others that socket arrives
    this.dispatch({ type: "join", userid: socket.userid }, socket);

    console.log("users are " + this.sockets.map((s) => s.userid).join(","));
  }

  removeSocket(socket) {
    this.sockets = this.sockets.filter(s => s !== socket);
    this.dispatch({ type: "leave", userid: socket.userid }, socket);
  }

  dispatch(msg, exceptSocket) {
    delete msg.socket;

    if (this.sockets.length > 1)
      console.log("dispatch ", messageToString(msg));


    this.sockets.forEach(s => {
      if (s != exceptSocket) {
        s.send(JSON.stringify(msg))
        console.log("  to user " + s.userid);
      }
    });
  }
}


const credentials = {
  cert: fs.readFileSync('tableaunoir_irisa_fr.pem'),
  key: fs.readFileSync('private.pem')
};

const httpsServer = https.createServer(credentials);

const server = new WebSocket.Server({
//  port: 443,
  server: httpsServer
});

let sockets = [];

console.log("Tableaunoir server -- Welcome");

server.on('connection', function (socket) {
  console.log("New connection!")
  socket.userid = generateUserID();
  sockets.push(socket);

  socket.on('message', (msg) => {
    console.log("from user " + socket.userid + " received " + messageToString(msg));
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

  switch (msg.type) {
    case "share":
      id = generateTableauID();
      tableaunoirs[id] = new TableauNoir();
      msg.socket.id = id;
      tableaunoirs[id].addSocket(msg.socket);
      msg.socket.send(JSON.stringify({ type: "id", id: id }));
      break;

    case "join":
      if (tableaunoirs[id] == undefined) {
        console.log("automatic creation of a tableaunoir of id " + msg.id)
        tableaunoirs[id] = new TableauNoir();
      }
      msg.socket.id = id;
      tableaunoirs[id].addSocket(msg.socket);
      break;

    default:
      tableaunoirs[id].dispatch(msg, msg.socket);
  }




}