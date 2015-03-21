require('./app/server.js');

process.on('exit', function(){
  console.log('exiting');
});