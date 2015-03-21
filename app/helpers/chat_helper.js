const SOCKET_EVENT_CHAT = 'chat';

var handleChatMsg = function (socket, msg, callback) {
	logger.info("Chat message received from socket id: " + socket.id + " message: " + msg);
	if (!msg.clientId) {
		callback(new Error("Invalid clientId"), null);
	}
	else {
		// Fetch nearby clients from location_manager
	}
};


module.exports = {
	handleChatMsg: handleChatMsg,
  SOCKET_EVENT_CHAT: SOCKET_EVENT_CHAT
};