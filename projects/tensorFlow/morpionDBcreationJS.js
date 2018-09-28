window.addEventListener('load', init);
var ctx, canvas
var width, height
var socket
//
// var tab = []
// tab[0] = {0: 5, nom:"sylvain"}
// tab[1] = {1: 15, nom:"vain"}
// console.log(tab)


function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  initPartie()
  loop()
}
function loop(){
  dessin()
  if (ready) predict()
  requestAnimationFrame(loop);
}
var ready = false
var inputs = []
var labels = []
var labelList = [
  'i1',
  'i2',
  'i3',
  'i4',
  'i5',
  'i6',
  'i7',
  'i8',
  'i9'
]

function predict(){
  tf.tidy( () => {
    let xs = tf.tensor2d([
      [Partie.grid[0][0],
      Partie.grid[0][1],
      Partie.grid[0][2],
      Partie.grid[1][0],
      Partie.grid[1][1],
      Partie.grid[1][2],
      Partie.grid[2][0],
      Partie.grid[2][1],
      Partie.grid[2][2],
      ]
    ])
    let results = model.predict(xs)
    let indice = results.argMax(1).dataSync()[0]
    let finalResult = labelList[indice]
    console.log(finalResult)
  })

}

var model, xs, ys
async function train(){
  let options = {
    epochs: 100,
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
    inputs.push([record.i1, record.i2, record.i3, record.i4, record.i5, record.i6, record.i7, record.i8, record.i9])
    labels.push(labelList.indexOf(record.label))
  }
  let labelsTensor = tf.tensor1d(labels, 'int32')
  xs = tf.tensor2d(inputs)
  ys = tf.oneHot(labelsTensor, 9)
  // xs.print()
  // ys.print()
  // console.log(xs.shape)
  // console.log(ys.shape)

  model = tf.sequential()
  let hiddenLayer1 = tf.layers.dense({
    units: 16,
    activation: 'sigmoid',
    inputDim: 9
  })
  let hiddenLayer2 = tf.layers.dense({
    units: 16,
    activation: 'sigmoid',
  })
  let outputLayer = tf.layers.dense({
    units: 9,
    activation: 'softmax' // utile pour des %
  })
  model.add(hiddenLayer1)
  model.add(hiddenLayer2)
  model.add(outputLayer)

  let lr = 0.5
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
  pourcentJouerCase: 0.5,

  widthCase: 150,
  offset: 150,
}

function initPartie(){
  for(let i=0; i<3; i++){
    Partie.grid[i] = []
    for(let j=0; j<3; j++){
      Partie.grid[i][j] = 0
    }
  }
  for(let i=0; i<3; i++){
    for(let j=0; j<3; j++){
      if(Math.random()>0.5){ // Si c'est à moi de jouer
        if(Math.random()<Partie.pourcentJouerCase){ // Si je veux jouer cette case
          Partie.grid[i][j] = 1
        }
      }
      else{ // Si c'est a l'ennemi
        if(Math.random()<Partie.pourcentJouerCase){ // Si adversaire veux jouer cette case
          Partie.grid[i][j] = 0.5
        }
      }
      if(i === 1 && j ===1){
        if(Math.random()>0.5) Partie.grid[i][j] = 1
        else Partie.grid[i][j] = 0.5
      }
    }
  }
  if(checkWon()) initPartie()
}


document.onclick = e =>{
  ligne = Math.floor((e.clientY-Partie.offset)/Partie.widthCase)
  colonne = Math.floor((e.clientX-Partie.offset)/Partie.widthCase)

  if(ligne>=0 && ligne<3 && colonne>=0 && colonne<3){
    if     (ligne === 0 && colonne === 0) socket.emit('data', Partie.grid, 'i1')
    else if(ligne === 0 && colonne === 1) socket.emit('data', Partie.grid, 'i2')
    else if(ligne === 0 && colonne === 2) socket.emit('data', Partie.grid, 'i3')
    else if(ligne === 1 && colonne === 0) socket.emit('data', Partie.grid, 'i4')
    else if(ligne === 1 && colonne === 1) socket.emit('data', Partie.grid, 'i5')
    else if(ligne === 1 && colonne === 2) socket.emit('data', Partie.grid, 'i6')
    else if(ligne === 2 && colonne === 0) socket.emit('data', Partie.grid, 'i7')
    else if(ligne === 2 && colonne === 1) socket.emit('data', Partie.grid, 'i8')
    else if(ligne === 2 && colonne === 2) socket.emit('data', Partie.grid, 'i9')
    Partie.pourcentJouerCase = Math.random()
    initPartie()
  }
}




function checkWon(idGame){
  // Player win :
  if(Partie.grid[0][0] == 1 && Partie.grid[1][1] == 1 && Partie.grid[2][2] == 1){ // Diago 1
    return true
  }
  if(Partie.grid[0][2] == 1 && Partie.grid[1][1] == 1 && Partie.grid[2][0] == 1){ // Diago 2
    return true
  }
  for(i=0; i<3; i++){
    if(Partie.grid[i][0] == 1 && Partie.grid[i][1] == 1 && Partie.grid[i][2] == 1){ // 3 lignes
      return true
    }
    if(Partie.grid[0][i] == 1 && Partie.grid[1][i] == 1 && Partie.grid[2][i] == 1){ // 3 colonnes
      return true
    }
  }
  // Computer win :
  if(Partie.grid[0][0] == 0.5 && Partie.grid[1][1] == 0.5 && Partie.grid[2][2] == 0.5){ // Diago 1
    return true
  }
  if(Partie.grid[0][2] == 0.5 && Partie.grid[1][1] == 0.5 && Partie.grid[2][0] == 0.5){ // Diago 2
    return true
  }
  for(i=0; i<3; i++){
    if(Partie.grid[i][0] == 0.5 && Partie.grid[i][1] == 0.5 && Partie.grid[i][2] == 0.5){ // 3 lignes
      return true
    }
    if(Partie.grid[0][i] == 0.5 && Partie.grid[1][i] == 0.5 && Partie.grid[2][i] == 0.5){ // 3 colonnes
      return true
    }
  }
  // Match null :
  let cpt = 0
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(Partie.grid[i][j] == 1 || Partie.grid[i][j] == 0.5){
        cpt++
      }
    }
  }
  if(cpt == 9){
    return true
  }
  let cptMoi = 0
  let cptAdvers = 0
  for(let i=0; i<3; i++){
    for(let j=0; j<3; j++){
      if(Partie.grid[i][j] === 1) cptMoi++
      if(Partie.grid[i][j] === 0.5) cptAdvers++
    }
  }
  if((cptMoi != cptAdvers) && (cptMoi != cptAdvers-1)){ // impossible de jouer car trop de coup d un cote ou de l autre
    return true
  }
  // Still on :
  return false
}



function dessin(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = "#000000"
  for(let i=0; i<3; i++){
    for(let j=0; j<3; j++){
      ctx.strokeRect(i*Partie.widthCase+Partie.offset, j*Partie.widthCase+Partie.offset, Partie.widthCase, Partie.widthCase);
    }
  }


  for(let i=0; i<3; i++){
    for(let j=0; j<3; j++){
      if(Partie.grid[i][j] === 1){
        ctx.strokeStyle = "#00ff00"
        ctx.beginPath()
        ctx.arc(Partie.widthCase*j + Partie.offset*1.5, Partie.widthCase*i + Partie.offset*1.5, Partie.widthCase/4, 0, 2*Math.PI)
      	ctx.stroke()
      }
      if(Partie.grid[i][j] === 0.5){
        ctx.strokeStyle = "#ff0000"
        ctx.strokeRect(Partie.widthCase*j + Partie.offset*1.25, Partie.widthCase*i + Partie.offset*1.25, Partie.widthCase/2, Partie.widthCase/2);
      }
    }
  }
}
