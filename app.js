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

GLOBAL.os = require("os");
GLOBAL.httpClient = require('http');

//By default, if there is no active connection to the redis server, commands are added to a queue and 
//are executed once the connection has been established. Setting enable_offline_queue to false will disable this feature
redisOptions = {enable_offline_queue: false};
GLOBAL.redisClient = require("redis").createClient(process.env.REDIS_PORT, process.env.REDIS_HOST, redisOptions);

redisClient.on('error', function(err){
  logger.error('Redis client error. Error: ' + err.message);
});

redisClient.on('connect', function(err){
  logger.info('Redis connection established');
});

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
