var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var fs = require('fs');

server.listen(8080);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/indexMnist.html');
});

app.get('/mnistJS.js', function(req, res) {
    res.sendFile(__dirname + '/mnistJS.js');
});

// app.get('/data.json', function(req, res) {
//     res.sendFile(__dirname + '/data.json');
// });

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
    for(let i=0; i<28; i++){
      for(let j=0; j<28; j++){
        grid[1+i+28*j] = data[i][j]
      }
    }
    grid.label = label
    fs.appendFile('dataMnistSaved.json', JSON.stringify(grid) + ',\n', err =>{
      if(err) throw err
      //console.log(JSON.stringify(grid))
    })
  })
  socket.on('giveMeData', () =>{
    fs.readFile('dataMnist.json', (err, data) =>{
      let toSend = JSON.parse(data)
      io.emit('dataSent', toSend)
    })
  })


  socket.on('disconnect', () =>{
    console.log('Disconnected : ' + socket.id);
  });
});
