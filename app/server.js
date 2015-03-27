
var sticky = require('socketio-sticky-session');

var options = {
  proxy: false, //activate layer 4 patching
  header: 'x-forwarded-for', //provide here your header containing the users ip
  num: process.env.NUM_INSTANCES=2, //count of processes to create, defaults to maximum if omitted
  // sync: {
  //   isSynced: true, //activate synchronization
  //   event: 'mySyncEventCall' //name of the event you're going to call
  // }
}

var server = sticky(options, function() {

  var app = require("express")();

  var port = process.env.CHAT_SERVICE_PORT;
  // var io = require('socket.io').listen(app.listen(port));
  var server  = require('http').createServer(app);
  var io = require('socket.io').listen(server);

  var redis = require('socket.io-redis');
  io.adapter(redis({ host: 'localhost', port: 6379 }));


  var chatHelper = require ('./helpers/chat_helper.js');
  var clientHelper = require ('./helpers/client_helper.js');
   
  app.get("/", function(req, res){
    res.end("It works!");
  });
  app.get("/send_message", function(req, res){
    // req.query
    res.end();
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
  return server;
}).listen(process.env.CHAT_SERVICE_PORT, function() {
  logger.info('server started on port: ' + process.env.CHAT_SERVICE_PORT);
});;