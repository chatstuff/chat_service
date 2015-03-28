const SOCKET_EVENT_REGISTER = 'register';

var handleConnection = function (socket, callback) {
  // register socketId
  logger.info("Client connected with socket id: " + socket.id);
  if (callback){

  }
};

var handleDisconnection = function (socket, callback) {
  logger.info("Client disconnected with id: " + socket.id);

  // unregister socketId and clientId
  redisClient.hget(process.env.APP_NAME + ":socket:" + socket.id, "client_id", function(err, clientId){
    if (clientId){
      redisClient.multi([["del", process.env.APP_NAME + ":client:" + clientId],
          ["del", process.env.APP_NAME + ":socket:" + socket.id]
      ]).exec(function (err, replies){
        if (err){
          logger.error("Client unregistration failed, redis error: " + err.message);
          callback(new Error("Redis set failed"));
        }
        else {
          callback(null);
        }
      });
    }
    else{
      redisClient.multi([["del", process.env.APP_NAME + ":socket:" + socket.id]
      ]).exec(function (err, replies){
        if (err){
          logger.error("Client unregistration failed, redis error: " + err.message);
          callback(new Error("Redis set failed"));
        }
        else {
          callback(null);
        }
      });
    }
  });
};

var handleRegistrationMsg = function (socket, msg, callback) {
  logger.info("Registeration attempted by socket id: " + socket.id);
  if (!msg.clientId) {
    callback(new Error("Invalid clientId"));
  }
  else {
    // register socketId with clientId

    redisClient.multi([["hset", process.env.APP_NAME + ":client:" + msg.clientId, "socket_id" , socket.id],
        ["hset", process.env.APP_NAME + ":client:" + msg.clientId, "host" , os.hostname()],
        ["hset", process.env.APP_NAME + ":socket:" + socket.id, "client_id" , msg.clientId],
        ["hset", process.env.APP_NAME + ":socket:" + socket.id, "host" , os.hostname()]
    ]).exec(function (err, replies){
      if (err){
        logger.error("Client registration failed, redis error: " + err.message);
        callback(new Error("Redis set failed"));
      }
      else {
        callback(null);
      }
    });
  }
};

module.exports = {
  handleConnection: handleConnection,
  handleDisconnection: handleDisconnection,
  handleRegistrationMsg: handleRegistrationMsg,
  SOCKET_EVENT_REGISTER: SOCKET_EVENT_REGISTER
};