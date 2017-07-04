var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// // get list
// app.get('/', function(req, res){
// 	res.sendFile(__dirname + '/index.html');
// });

io.on('connection', function(socket){
	console.log('a user connected');
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	// unity get list contact
	app.get('/getListContact', function(req, res){
		socket.on('getListContact', function(data){
			res.send(data);
		})
	});

	// unity send number to call
	//app.post('/postNumber', )

	// unity get list image
	app.get('/getListImage', function(req, res){
		socket.on('getListImage', function(data){
			res.sendFile(data);
		})
	});

	// unity post image


	// unity get list music
	app.get('/getListMusic', function(req, res){
		socket.on('getListMusic', function(data){
			res.send(data);
		})
	});

	// unity post name music to play
	
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
