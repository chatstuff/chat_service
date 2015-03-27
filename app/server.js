var cluster = require('cluster');

if (cluster.isMaster){
  var numInstances = process.env.NUM_INSTANCES ? process.env.NUM_INSTANCES : 1;
  var workerPorts = process.env.CHAT_SERVICE_PORTS.split(',');
  if (workerPorts.length != numInstances) {
    logger.error('workerPorts.length != numInstances');
    process.exit(1);
  }
  for (var i = 0; i < numInstances; i++){
    cluster.fork({WORKER_PORT: workerPorts[i]});
  }
}
else{
  var app = require("express")();
  var chatHelper = require ('./helpers/chat_helper.js');
  var clientHelper = require ('./helpers/client_helper.js');

  // var port = process.env.CHAT_SERVICE_PORT;
  var port = process.env.WORKER_PORT;
   
  app.get("/", function(req, res){
    res.send("It works!");
  });
   
  var io = require('socket.io').listen(app.listen(port));
  //app.listen(port);
  logger.info("Listening on port " + port);

  io.sockets.on('connection', function (socket) {
    logger.info("New connection on port " + port);
    clientHelper.handleConnection(socket, null);

    socket.on('disconnect', function () {
      clientHelper.handleDisconnection(socket, null);
    });

    socket.on(clientHelper.SOCKET_EVENT_REGISTER, function (data) {
      // logger.info("Received a message. event: send message: " + JSON.stringify(data));
      // io.sockets.emit('message', data);
    });

    socket.on(chatHelper.SOCKET_EVENT_CHAT, function (data, callback) {
      chatHelper.handleChatMsg(socket, data, function(err, ackMessage){
        if (err) {
          logger.error('Error in chat message. Error: ' + err.message);
          callback(err.message, null);
        }
        else {
          callback(null, ackMessage);
        }
      }, function(err, clientList){
        if (err) {
          logger.error('Error getting chat recipients. Error: ' + err.message);
        }
        else {
          logger.error('Chat recipients: ' + JSON.stringify(clientList));
          // send message to the clients in clientList
          // They might be on different host or on different process on the same host
          // use redis or something for different host and cluster messaging for same host
        }
      });
    });
  });
}

