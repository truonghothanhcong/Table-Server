var express = require('express');
var app = express();
var http = require('http').Server(app);
var fs  = require('fs');
var multer = require('multer');
var bodyParser = require("body-parser");
var path = require('path');
var formidable = require('formidable');
var io = require('socket.io')(http);
var numberOfColor = 0;

// // get list
// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/index.html');
// });

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

const directory = path.join(__dirname, '/uploads');



app.post('/upload', function(req, res){

  // remove all file in folder
  fs.readdir(directory, (err, files) => {
	  if (err) throw error;

	  for (const file of files) {
	    fs.unlink(path.join(directory, file), err => {
	      if (err) throw error;
	    });
	  }
	});

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  //form.keepExtensions = true;

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

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
	// push token in array to manager
	connections.push(socket);
	console.log('a user connected');
	console.log(socket.id)

	socket.on('EMITPLAY', function(data){
		console.log(data);
		socket.emit('play', data);
	})

	socket.on('still', function(){
		console.log('on still')
		//console.log('phone is trying to connect' + connections.length)
		// send change color
		socket.emit('changeColor', numberOfColor % 3);
		numberOfColor = numberOfColor + 1
	})

	// success change color and return data is color name
	socket.on('colorChanged', function(data){
		console.log('on color colorChanged')
		//console.log('sent colorChange ' + connections.length)
		var index = connections.indexOf(socket);
		//connections[index].removeAllListeners('colorChanged');
		
		// notify for unity with id of mobile and color name
		connections[0].emit('haveAMobileConnect', {id: connections[index].id, color: data[0]})
		console.log("mau nhan duoc la: ", data[0]);
		//console.log('id da gui la ', connections[0].id);
	})

	socket.on('move', function(data){
		connections[0].emit('move', {id: socket.id})
		console.log('phone moved')
	})

	// // get messsage detect success or not
	// connections[0].on('isDetectSuccess', function(data){
	// 	socket.emit('resultDetect', data)
	// })

	if (connections.length == 1){
		//unity is connecting, set listener for result
		socket.on('isDetectSuccess', function(data){
			console.log(data)
			var id = data.id;
			console.log(id);
			var state = data.state;
			//console.log(" " + id + " ... " + state);

			var index = findIndex(id);
			connections[index].emit('connectResult', state);
		})
	}

	socket.on('disconnect', function(){
		// Get socket index
		var index = connections.indexOf(socket);

		if (index >= 1) {
			console.log('user disconnected' + connections[index].id);
		}
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

// // unity change color mobile
// app.get('/changeColor/:id', function(req, res){
// 	//console.log(req.query.q);
// 	var id = req.params.id.replace(':', '')
// 	var index = findIndex(id)
// 	//console.log(id)
// 	connections[index].emit('changeColor', req.query.q);

// 	connections[index].on('colorChanged', function(data){
// 		connections[index].removeAllListeners('colorChanged');
// 		return res.send(data);
// 	})
// });



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

app.get('/playContinue/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	connections[index].emit('playContinue')
})

app.get('/pause/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	connections[index].emit('pause')
})

app.get('/downloadImage/:id', function(req, res){
	// get id
	var id = req.params.id.replace(':', '')
	// find socket to action
	var index = findIndex(id)

	// get all file name in folder upload
	fs.readdir('./uploads', (err, files) => {
		console.log('emit download image')
		console.log(files)
		connections[index].emit('downloadImage', files[0])
	})
})
//========================= SOCKET UNITY ==========================//



http.listen(3000, function(){
	console.log('listening on *:3000');
});
