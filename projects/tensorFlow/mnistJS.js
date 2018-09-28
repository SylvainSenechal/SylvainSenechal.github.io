window.addEventListener('load', init);
var ctx, canvas
var width, height
var socket



function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  createChart()
  initCanvas()
  loop()
}
// load en defer les scripts pour pas avoir d erreur sur script tensorflow
function loop(){
  dessin()
  if (ready) predict()
  requestAnimationFrame(loop);
}
var ready = false
var inputs = []
var labels = []
var labelList = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9'
]

function predict(){
  tf.tidy( () => {
    let tab = []
    let inputs = []
    for(let i=0; i<Partie.nbCase; i++){
      for(let j=0; j<Partie.nbCase; j++){
        tab.push(Partie.grid[i][j])
      }
    }
    let xs = tf.tensor2d([tab])
    let results = model.predict(xs)
    results.data().then(x => {
      myChart.data.datasets[0].data = x//console.log(x[0]))
      myChart.update()
    })
    let indice = results.argMax(1).dataSync()[0]
    let finalResult = labelList[indice]
    document.getElementById('result').innerHTML = 'Result guessed : ' + finalResult
  })

}

var model, xs, ys
async function train(){
  let options = {
    epochs: 1000,
    validationSplit: 0.05,
    shuffle: true,
    callbacks: {
      onTrainBegin: () => console.log('training start'),
      onTrainEnd: () => console.log('training end'),
      onBatchend: (num, logs) =>{
        return tf.nextFrame()
      },
      onEpochEnd: (num, logs) => {
        console.log('epoch : ' + num)
        console.log('loss : ' + logs.loss)
      }
    }
  }
  return await model.fit(xs, ys, options)
}
socket = io.connect('http://192.168.1.132:8080');
socket.emit('giveMeData');

socket.on('dataSent', data =>{
  ready = true
  for(let record of data.entries){
    let tab = []
    for(let i=0; i<Partie.nbCase; i++){
      for(let j=0; j<Partie.nbCase; j++){
        tab.push(record[1+i+j*28])
      }
    }
    inputs.push(tab)
    labels.push(labelList.indexOf(record.label))
  }
  let labelsTensor = tf.tensor1d(labels, 'int32')
  xs = tf.tensor2d(inputs)
  ys = tf.oneHot(labelsTensor, 10)
  // xs.print()
  // ys.print()
  // console.log(xs.shape)
  // console.log(ys.shape)

  model = tf.sequential()
  let hiddenLayer1 = tf.layers.dense({
    units: 784,
    activation: 'elu',
    inputDim: 784
  })
  let outputLayer = tf.layers.dense({
    units: 10,
    activation: 'softmax' // utile pour des %
  })
  model.add(hiddenLayer1)
  model.add(outputLayer)

  let lr = 0.01
  let optimizer = tf.train.sgd(lr) // Voir video 7.9

  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy' // erreur entre output connue et output devinee
  })

  train().then(results => {
    console.log(results.history.loss)
  })
})

Partie = {
  grid: [],

  widthCase: 10,
  nbCase: 28,
  offset: 150,
}

function initCanvas(){
  for(let i=0; i<Partie.nbCase; i++){
    Partie.grid[i] = []
    for(let j=0; j<Partie.nbCase; j++){
      Partie.grid[i][j] = 0
    }
  }
}



function sendLabel(){
  let label = document.getElementById('label').innerHTML
  socket.emit('data', Partie.grid, label)
  initCanvas()
  document.getElementById('label').innerHTML = 'Label Number'

}

document.onkeydown = function(e){
  if(e.keyCode === 96 || e.keyCode === 48) document.getElementById('label').innerHTML = 0
  else if(e.keyCode === 97 || e.keyCode === 49) document.getElementById('label').innerHTML = 1
  else if(e.keyCode === 98 || e.keyCode === 50) document.getElementById('label').innerHTML = 2
  else if(e.keyCode === 99 || e.keyCode === 51) document.getElementById('label').innerHTML = 3
  else if(e.keyCode === 100 || e.keyCode === 52) document.getElementById('label').innerHTML = 4
  else if(e.keyCode === 101 || e.keyCode === 53) document.getElementById('label').innerHTML = 5
  else if(e.keyCode === 102 || e.keyCode === 54) document.getElementById('label').innerHTML = 6
  else if(e.keyCode === 103 || e.keyCode === 55) document.getElementById('label').innerHTML = 7
  else if(e.keyCode === 104 || e.keyCode === 56) document.getElementById('label').innerHTML = 8
  else if(e.keyCode === 105 || e.keyCode === 57) document.getElementById('label').innerHTML = 9
}

var mouseDown = false
document.onmousedown = function(e){
  mouseDown = true
}
document.onmouseup = function(e){
  mouseDown = false
}

document.onmousemove = function(e){
  l = Math.floor((e.clientX-Partie.offset)/Partie.widthCase)
  c = Math.floor((e.clientY-Partie.offset)/Partie.widthCase)
  if(mouseDown){
    try{
      Partie.grid[l][c] = 1
      Partie.grid[l-1][c] = (0.5>Partie.grid[l-1][c]) ? 0.5 : Partie.grid[l-1][c]
      Partie.grid[l-2][c] = (0.25>Partie.grid[l-2][c]) ? 0.25 : Partie.grid[l-2][c]

      Partie.grid[l+1][c] = (0.5>Partie.grid[l+1][c]) ? 0.5 : Partie.grid[l+1][c]
      Partie.grid[l+2][c] = (0.25>Partie.grid[l+2][c]) ? 0.25 : Partie.grid[l+2][c]

      Partie.grid[l][c] = 1
      Partie.grid[l][c-1] = (0.5>Partie.grid[l][c-1]) ? 0.5 : Partie.grid[l][c-1]
      Partie.grid[l][c-2] = (0.25>Partie.grid[l][c-2]) ? 0.25 : Partie.grid[l][c-2]
      Partie.grid[l][c+1] = (0.5>Partie.grid[l][c+1]) ? 0.5 : Partie.grid[l][c+1]
      Partie.grid[l][c+2] = (0.25>Partie.grid[l][c+2]) ? 0.25 : Partie.grid[l][c+2]

      Partie.grid[l-1][c-1] = (0.5>Partie.grid[l-1][c-1]) ? 0.5 : Partie.grid[l-1][c-1]
      Partie.grid[l+1][c+1] = (0.5>Partie.grid[l+1][c+1]) ? 0.5 : Partie.grid[l+1][c+1]
      Partie.grid[l-1][c+1] = (0.5>Partie.grid[l-1][c+1]) ? 0.5 : Partie.grid[l-1][c+1]
      Partie.grid[l+1][c-1] = (0.5>Partie.grid[l+1][c-1]) ? 0.5 : Partie.grid[l+1][c-1]
    }
    catch(err){
      //console.log(err)
    }

  }
}



function dessin(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  for(let i=0; i<Partie.nbCase; i++){
    for(let j=0; j<Partie.nbCase; j++){
      if(Partie.grid[i][j] === 0){
        ctx.fillStyle = "#000000"
      }
      else{
        ctx.fillStyle = 'rgb(' +Partie.grid[i][j]*255+ ',' +Partie.grid[i][j]*255+ ',' +Partie.grid[i][j]*255+ ')'
      }
      ctx.fillRect(i*Partie.widthCase+Partie.offset, j*Partie.widthCase+Partie.offset, Partie.widthCase, Partie.widthCase);
    }
  }
}
var context
var myChart
function createChart(){
  context = document.getElementById("myChart").getContext('2d');
  myChart = new Chart(context, {
    type: 'bar',
    data: {
      labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
      datasets: [{
        label: '# of Votes',
        data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
        ],
        borderColor: [
          'rgba(255,99,132,1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero:true
          }
        }]
      }
    }
  });
}
