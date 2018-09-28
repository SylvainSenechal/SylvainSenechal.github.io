var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');

server.listen(8080);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/indexMorpionDBcreation.html');
});

app.get('/morpionDBcreationJS.js', function(req, res) {
    res.sendFile(__dirname + '/morpionDBcreationJS.js');
});

app.get('/data.json', function(req, res) {
    res.sendFile(__dirname + '/data.json');
});

// app.get('/socket.io/socket.io.js', function(req, res) {
//     res.sendFile(__dirname + '/socket.io/socket.io.js');
// });



/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////


// io.emit : tout le monde
// socket.broadcast.emit : tout le monde sauf soit
// socket.emit : juste à soit non fonctionnel ?

io.on('connection', socket =>{
  console.log("Connection : " + socket.id);
  // fs.readFile('data.json', (err, data) =>{
  //   console.log(JSON.parse(data))
  // })
  socket.on('data', (data, label) =>{
    let grid = {}
    grid.i1 = data[0][0]
    grid.i2 = data[0][1]
    grid.i3 = data[0][2]
    grid.i4 = data[1][0]
    grid.i5 = data[1][1]
    grid.i6 = data[1][2]
    grid.i7 = data[2][0]
    grid.i8 = data[2][1]
    grid.i9 = data[2][2]
    grid.label = label
    fs.appendFile('dataSaved.json', JSON.stringify(grid) + ',\n', err =>{
      if(err) throw err
      console.log(JSON.stringify(grid))
    })
  })
  socket.on('giveMeData', () =>{

    fs.readFile('data.json', (err, data) =>{
      let toSend = JSON.parse(data)
      io.emit('dataSent', toSend)
    })
  })


  socket.on('disconnect', () =>{
    console.log('Disconnected : ' + socket.id);
  });
});
