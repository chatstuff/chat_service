console.log('loading environment: ' + process.env.NODE_ENV);

envFile = "./.env." + process.env.NODE_ENV;
console.log('loading env file: ' + envFile);
require('dotenv').config({path: envFile});

var log4js = require('log4js');
log4js.configure({
  appenders: [
    { 
    	type: 'file',
    	filename: process.env.LOG_FILE_PATH,
    	category: 'chat_service'
    }
  ],
  levels: {
    "chat_service":  process.env.LOG_LEVEL
  }
});

GLOBAL.logger = log4js.getLogger('chat_service');

GLOBAL.httpClient = require('http');

process.on('uncaughtException', function (err) {
  logger.error('****************UNCAUGHT EXCEPTION*******************');
  logger.error(err);
  console.log('****************UNCAUGHT EXCEPTION*******************');
  console.log(err);
});

require('./app/server.js');

process.on('exit', function(){
  logger.info('exiting...');
  console.log('exiting...');
});
