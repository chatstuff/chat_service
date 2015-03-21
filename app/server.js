var express = require("express");
var app = express();
var port = 3700;
 
app.get("/", function(req, res){
  res.send("It works!");
});
 
var io = require('socket.io').listen(app.listen(port));
//app.listen(port);
console.log("Listening on port " + port);

io.sockets.on('connection', function (socket) {
  console.log('Received a connection')
  socket.emit('message', { message: 'welcome to the chat' });
  socket.on('send', function (data) {
  	console.log("Received a message. event: send message: " + JSON.stringify(data));
    io.sockets.emit('message', data);
  });
});
