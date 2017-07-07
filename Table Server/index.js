var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs  = require('fs');
var multer = require('multer');
var bodyParser = require("body-parser");
var path = require('path');
var formidable = require('formidable');
var io = require('socket.io')(http);

// // get list
// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/index.html');
// });

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.post('/upload', function(req, res){


  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  form.keepExtensions = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  // form.on('file', function(field, file) {
  //   fs.rename(file.path, path.join(form.uploadDir, file.name));
  // });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);
});

var connections = [];

function findIndex(id) {
	for (i = 0; i < connections.length; ++i)
		if (connections[i].id == id)
			return i
	return -1
}

io.on('connection', function(socket){
	// push token in array to manager
	connections.push(socket);
	console.log('a user connected');
	console.log(socket.id)

	socket.on('disconnect', function(){
		// Get socket index
		var index = connections.indexOf(socket);

		// Remove the socket from the connections
        connections.splice(index, 1); 
		console.log('user disconnected');
	});
});

// ================================================
app.get('/getTokenID', function(req, res){
	var id = []

	for (i = 0; i < connections.length; ++i)
		id.push(connections[i].id)

	//console.log(id)
	res.send(id)
})

// unity change color mobile
app.get('/changeColor/:id', function(req, res){
	//console.log(req.query.q);
	var id = req.params.id.replace(':', '')
	var index = findIndex(id)
	//console.log(id)
	connections[index].emit('changeColor', req.query.q);

	connections[index].on('colorChanged', function(data){
		connections[index].removeAllListeners('colorChanged');
		return res.send(data);
	})
});



// unity get list contact
app.get('/getListContact/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)
	connections[index].emit('getListContact')

	connections[index].on('listContact', function(data){
		connections[index].removeAllListeners('listContact');
		return res.send(data);
	})
});

// unity send number to call
app.get('/call/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	connections[index].emit('call', req.query.number)
});

// unity get list image
app.get('/getImages/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	connections[index].emit('getImages')

	connections[index].on('imageDone', function(){
		connections[index].removeAllListeners('imageDone');

		// get all file name in folder upload
		fs.readdir('./uploads', (err, files) => {
			return res.send(files)
		})
	})
});

// unity post image


// unity get list music
app.get('/getListMusic/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	connections[index].emit('getListMusic')

	connections[index].on('listMusic', function(data){
		connections[index].removeAllListeners('listMusic');
		return res.send(data);
	})
});

// unity play music with name
app.get('/playMusic/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	connections[index].emit('playMusic', req.query.name)
});
///===================================================

http.listen(3000, function(){
	console.log('listening on *:3000');
});
