const SOCKET_EVENT_CHAT = 'chat';

var handleChatMsg = function (socket, msg, clientCallback, clientListCallback) {
  logger.info("Chat message received from socket id: " + socket.id + " message: " + JSON.stringify(msg));
  if (!msg.clientId) {
    clientCallback(new Error("Invalid clientId"), null);
  }
  else {
    clientCallback(null, {text: 'chat_success'});
    // Fetch nearby clients from location_manager
    var clientList = ["9868411311", "9739517079"];
    var clientCount = clientList.length;
    var redisQuery = []
    // should this loop by async?
    for (var i = 0; i < clientCount; i++){
      redisQuery.push(["hget", process.env.APP_NAME + ":client:" + clientList[i], "socket_id"]);
    }
    logger.debug("Redis query for chat: " + JSON.stringify(redisQuery));
    redisClient.multi(redisQuery).exec(function(err, sockets){
      if (err){
        logger.error("Error getting sockets from redis. Error: " + err.message);
        clientListCallback(new Error("Redis error"), null);
      }
      else {
        logger.debug("List of sockets received: " + JSON.stringify(sockets));
        clientSockets = {};
        // should this loop by async?
        for (var i = 0; i < clientCount; i++){
          if (sockets[i]){
            clientSockets[clientList[i]] = sockets[i];
          }
        }
        logger.debug("List of clientSockets: " + JSON.stringify(clientSockets));
        clientListCallback(null, clientSockets);
      }
    });
  }
};


module.exports = {
  handleChatMsg: handleChatMsg,
  SOCKET_EVENT_CHAT: SOCKET_EVENT_CHAT
};