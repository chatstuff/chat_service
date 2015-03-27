const SOCKET_EVENT_CHAT = 'chat';

var handleChatMsg = function (socket, msg, clientCallback, clientListCallback) {
	logger.info("Chat message received from socket id: " + socket.id + " message: " + JSON.stringify(msg));
	if (!msg.clientId) {
		clientCallback(new Error("Invalid clientId"), null);
	}
	else {
		clientCallback(null, {text: 'chat_success'});
		// Fetch nearby clients from location_manager
		clientListCallback(null, ['244343', '65546365'])
	}
};


module.exports = {
	handleChatMsg: handleChatMsg,
  SOCKET_EVENT_CHAT: SOCKET_EVENT_CHAT
};