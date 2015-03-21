// var express = require("express");
var app = require("express")();
var chatHelper = require ('./helpers/chat_helper.js');
var clientHelper = require ('./helpers/client_helper.js');

var port = process.env.CHAT_SERVICE_PORT;
 
app.get("/", function(req, res){
  res.send("It works!");
});
 
var io = require('socket.io').listen(app.listen(port));
//app.listen(port);
logger.info("Listening on port " + port);

io.sockets.on('connection', function (socket) {
  clientHelper.handleConnection(socket, null);

  socket.on('disconnect', function () {
  	clientHelper.handleDisconnection(socket, null);
  });

  socket.on(clientHelper.SOCKET_EVENT_REGISTER, function (data) {
  	// logger.info("Received a message. event: send message: " + JSON.stringify(data));
    // io.sockets.emit('message', data);
  });

  socket.on(chatHelper.SOCKET_EVENT_CHAT, function (data) {
  	// logger.info("Received a message. event: send message: " + JSON.stringify(data));
    // io.sockets.emit('message', data);
		chatHelper.handleChatMsg(socket, data, function(err, clients){
			if (err) {
				logger.info(err.message);
			}
			else {

			}
		});
  });
});