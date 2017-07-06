var app = require('express')();
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

app.post('/upload', function(req, res){


  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

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


io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	// unity change color mobile
	app.get('/changeColor', function(req, res){
		//console.log(req.query.q);
		socket.emit('changeColor', req.query.q);

		socket.on('colorChanged', function(data){
			socket.removeAllListeners('colorChanged');
			return res.send(data);

		})
	});



	// unity get list contact
	app.get('/getListContact', function(req, res){
		socket.emit('getListContact')

		socket.on('listContact', function(data){
			socket.removeAllListeners('listContact');
			return res.send(data);
		})
	});

	// unity send number to call
	app.get('/call', function(req, res){
		socket.emit('call', req.query.number)
	});

	// unity get list image
	app.get('/getImages', function(req, res){
		socket.emit('getImages')

		socket.on('imageDone', function(){
			socket.removeAllListeners('imageDone');

			// get all file name in folder upload
			fs.readdir('./uploads', (err, files) => {
				return res.send(files)
			})
		})
	});

	// unity post image


	// unity get list music
	app.get('/getListMusic', function(req, res){
		socket.emit('getListMusic')

		socket.on('listMusic', function(data){
			socket.removeAllListeners('listMusic');
			return res.send(data);
		})
	});

	// unity play music with name
	app.get('/playMusic', function(req, res){
		socket.emit('playMusic', req.query.name)
	});
	
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
