var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var process = require('process');

var port = process.env.PORT || 3000;
var app = connect();

app.use(serveStatic(__dirname));

http.createServer(app).listen(port);
console.log('Accepting connections on port ' + port + '...');
