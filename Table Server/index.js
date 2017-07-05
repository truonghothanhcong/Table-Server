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

		socket.on('i', function(data){
			socket.removeAllListeners('images');
			return res.sendFile(data);
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
