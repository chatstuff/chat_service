var cluster = require('cluster');

if (cluster.isMaster){
  var numInstances = process.env.NUM_INSTANCES ? process.env.NUM_INSTANCES : 1;
  var workerPorts = process.env.CHAT_SERVICE_PORTS.split(',');
  if (workerPorts.length != numInstances) {
    logger.error('workerPorts.length != numInstances');
    process.exit(1);
  }
  for (var i = 0; i < numInstances; i++){
    // cluster.fork({WORKER_PORT: workerPorts[i]});

    var eachWorker = function eachWorker(callback) {
      for (var id in cluster.workers) {
        callback(cluster.workers[id]);
      }
    }

    for (var i = 0; i < process.env.NUM_INSTANCES; i++) {
      var worker = cluster.fork({WORKER_PORT: workerPorts[i]});

      worker.on('message', function(msg){
        if (msg.cmd) {
          switch (msg.cmd) {
            case 'broadcast':
            logger.debug ("Received message in master: " + JSON.stringify(msg));
              eachWorker (function(worker) {
                worker.send(msg);
              });
            break;
          }
        }
      });
    }
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
      clientHelper.handleDisconnection(socket, function(err){
        if (err){
          logger.error("Client disconnection not handled properly. socket: " + socket.id + " error: " + err.message);
        }
        else{
          logger.error("Client disconnection handled. socket: " + socket.id);
        }
      });
    });

    socket.on(clientHelper.SOCKET_EVENT_REGISTER, function (data, callback) {
      clientHelper.handleRegistrationMsg(socket, data, function(err){
        if (err){
          logger.error("Error while registration of client: " + JSON.stringify(data) + " error: " + err.message);
          callback(err, null);
        }
        else {
          // Figure out what do do when server restarts, registrations have to be removed from redis
          // maybe store hostname as well in key and delete all on clean exit
          // what to do for unclean exit?
          logger.debug("Successfully registered a client: " + JSON.stringify(data));
          callback(null, {staus: 'success'});
        }
      });
      // process.send({cmd: 'broadcast', socket_event: clientHelper.SOCKET_EVENT_REGISTER, data: data});
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
          process.send({cmd: 'broadcast', socket_event: chatHelper.SOCKET_EVENT_CHAT, data: {clientIds: clientList}});
        }
      });
    });
  });

  process.on('message', function(msg) {
    if (msg.socket_event) {
      switch (msg.socket_event) {
        case clientHelper.SOCKET_EVENT_REGISTER:
          logger.debug ("Received registration message in worker: " + JSON.stringify(msg));
        break;
        case chatHelper.SOCKET_EVENT_CHAT:
          logger.debug ("Received chat message in worker: " + JSON.stringify(msg));
        break;
      }
    }
  });
}

