
var cluster = require('cluster');

if (cluster.isMaster) {

  var server = require('http').createServer();
  var io = require('socket.io').listen(server);
  // var app = require("express")();
  // var io = require('socket.io').listen(app.listen(port));
  var socketioRedis = require('socket.io-redis');

  io.adapter(socketioRedis({host: 'localhost', port: 6379}));

  var eachWorker = function eachWorker(callback) {
    for (var id in cluster.workers) {
      callback(cluster.workers[id]);
    }
  }

  for (var i = 0; i < process.env.NUM_INSTANCES; i++) {
    var worker = cluster.fork();

    worker.on('message', function(msg){
      if (msg.cmd) {
        switch (msg.cmd) {
          case 'broadcast':
            // eachWorker (function(worker) {
            //   worker.send(msg);
            // });
          break;
        }
      }
    });
  }
  cluster.on('fork', function(worker) {
    console.log('worker %s spawned', worker.id);
  });
  cluster.on('online', function(worker) {
    console.log('worker %s online', worker.id);
  });
  cluster.on('listening', function(worker, addr) {
    console.log('worker %s listening on %s:%d', worker.id, addr.address, addr.port);
  });
  cluster.on('disconnect', function(worker) {
    console.log('worker %s disconnected', worker.id);
  });

  cluster.on('exit', function(worker, code, signal) {
    logger.error('worker ' + worker.process.pid + ' died with code: ' + code + ' signal: ' + signal);
    if (!worker.suicide) {
      console.log('restarting worker');
      cluster.fork();
    }
  });
}
else{
  var sticky = require('sticky-session');
  sticky(function() {
    var app = require("express")();
    var socketioRedis = require('socket.io-redis');
    var port = process.env.CHAT_SERVICE_PORT;
    // var io = require('socket.io').listen(app.listen(port));
    var server = require('http').createServer(app).listen(port);
    var io = require('socket.io').listen(server);
    io.adapter(socketioRedis({host: 'localhost', port: 6379}));

    var chatHelper = require ('./helpers/chat_helper.js');
    var clientHelper = require ('./helpers/client_helper.js');

     
    app.get("/", function(req, res){
      res.send("It works!");
    });

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
        // process.send({cmd: 'broadcast', socket_event: clientHelper.SOCKET_EVENT_REGISTER, data: data, socket: socket});
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
        // process.send({cmd: 'broadcast', socket_event: chatHelper.SOCKET_EVENT_CHAT, data: data, socket: socket});
      });
    });

    process.on('message', function(msg) {
      if (msg.socket_event) {
        switch (msg.socket_event) {
          case clientHelper.SOCKET_EVENT_REGISTER:
            logger.info ("Received message: " + JSON.stringify(msg));
          break;
          case clientHelper.SOCKET_EVENT_CHAT:
            logger.info ("Received message: " + JSON.stringify(msg));
          break;
        }
      }
    });
    return server;
  }).listen(process.env.CHAT_SERVICE_PORT, function(){
    logger.info('sticky server started on port: ' + process.env.CHAT_SERVICE_PORT);
  });
}