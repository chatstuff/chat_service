const SOCKET_EVENT_REGISTER = 'register';

var handleConnection = function (socket, callback) {
  // register socketId
  logger.info("Client connected with socket id: " + socket.id);
  if (callback){

  }
};

var handleDisconnection = function (socket, callback) {
  // unregister socketId and clientId
  logger.info("Client disconnected with id: " + socket.id);
  if (callback){
    
  }
};

var handleRegistrationMsg = function (msg, callback) {
  logger.info("Registeration attempted by socket id: " + socket.id);
  if (!msg.clientId) {
    callback(new Error("Invalid clientId"));
  }
  else {
    // register socketId with clientId
  }
};

module.exports = {
  handleConnection: handleConnection,
  handleDisconnection: handleDisconnection,
  handleRegistrationMsg: handleRegistrationMsg,
  SOCKET_EVENT_REGISTER: SOCKET_EVENT_REGISTER
};