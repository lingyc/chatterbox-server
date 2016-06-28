/* Import node's http module: */
var express = require('express');
var server = express();
var fs = require('fs');
var _chats = [];
// var handleRequest = require('./request-handler').requestHandler;

var readFile = function(callback) {
  fs.readFile('messageData.txt', 'utf-8', (err, chatData) => {
    if (err) { throw err; }
    callback(chatData);
  });
};

var writeFile = function(chatData) {
  fs.writeFile('messageData.txt', chatData, function(err) {
    if (err) {
      return console.log(err);
    }
  }); 
};

readFile((chatData) => _chats = JSON.parse(chatData || '[]'));

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var headers = defaultCorsHeaders;
headers['Content-Type'] = 'application/json';
// Every server needs to listen on a port with a unique number. The
// standard port for HTTP servers is port 80, but that port is
// normally already claimed by another server and/or not accessible
// so we'll use a standard testing port like 3000, other common development
// ports are 8080 and 1337.
var port = 3000;

// For now, since you're running this server on your local machine,
// we'll have it listen on the IP address 127.0.0.1, which is a
// special address that always refers to localhost.
var ip = '127.0.0.1';



// We use node's http module to create a server.
//
// The function we pass to http.createServer will be used to handle all
// incoming requests.
//
// After creating the server, we will tell it to listen on the given port and IP. */
server.use(express.static('client'));

server.options('/classes/messages', (request, response) => {
  response.header(headers);
  response.set(200).send();
});

server.get('/classes/messages', (request, response) => {
  response.header(headers);
  response.send({results: _chats});
});

server.post('/classes/messages', (request, response) => {
  request.on('data', chunk => {
    var data = JSON.parse(chunk.toString());
    data.createdAt = new Date;
    _chats.push(data);

    if (_chats.length > 100) { _chats.unshift(); }
    writeFile(JSON.stringify(_chats));
  });
  response.header(headers);
  response.set(201).send({statusCode: 201, success: 'Message received'});
});




server.listen(port, () => {
  console.log('Listening on http://' + ip + ':' + port);
});

// To start this server, run:
//
//   node basic-server.js
//
// on the command line.
//
// To connect to the server, load http://127.0.0.1:3000 in your web
// browser.
//
// server.listen() will continue running as long as there is the
// possibility of serving more requests. To stop your server, hit
// Ctrl-C on the command line.

