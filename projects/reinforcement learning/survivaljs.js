// Mate entre 2 individus collés, si assez de bouffe
// Nouvel individu avec peu de food
// gradient de couleur vie : vert au rouge
var ctx, canvas
var width = window.innerWidth
var height = window.innerHeight

const init = () => {
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')

  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"
}

const resize = () => {
	height = window.innerHeight;
	width = window.innerWidth;
  ctx.canvas.width = window.innerWidth
  ctx.canvas.height = window.innerHeight
}

var Global = {
  sizeX: 1000,
  sizey: 500,

  translateX: 0,
  translateY: 0,
}

Joueur = function(id, width, height){
  this.id = id

  let x = Math.random()*jeu.sizeX
  let y = Math.random()*jeu.sizeY
  this.x = x
  this.y = y
  this.cibleX = x
  this.cibleY = y

  this.translateX = width/2 - x,
  this.translateY = height/2 - y,

  this.size = 50
  this.speedX = 0
  this.speedY = 0
  this.canonOrientation = Math.random()*360
  this.color = getRandomColor()
}

const dessin= () => {
  //ctx.translate(-jeu.translateX, -jeu.translateY)
  ctx.clearRect(0, 0, width, height) // clear map

  ctx.strokeStyle = "#000000"
  // Lignes horizontales
  if(Me.translateY>0){ // Gestion < et > 0
    for(i=0; i<height/100; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*100 + Math.abs(Me.translateY%100));
      ctx.lineTo(width, i*100 + Math.abs(Me.translateY%100));
      ctx.stroke();
    }
  }
  else{
    for(i=0; i<height/100; i++){
      ctx.beginPath();
      ctx.moveTo(0, i*100 + Math.abs(-100-Me.translateY%100));
      ctx.lineTo(width, i*100 + Math.abs(-100-Me.translateY%100));
      ctx.stroke();
    }
  }

  // Lignes verticales
  ctx.strokeStyle = "#ff0000"
  if(Me.translateX>0){
    for(i=0; i<width/100; i++){
      ctx.beginPath();
      ctx.moveTo(i*100 + Math.abs(Me.translateX%100), 0);
      ctx.lineTo(i*100 + Math.abs(Me.translateX%100), height);
      ctx.stroke();
    }
  }
  else{
    for(i=0; i<width/100; i++){
      ctx.beginPath();
      ctx.moveTo(i*100 + Math.abs(-100-Me.translateX%100), 0);
      ctx.lineTo(i*100 + Math.abs(-100-Me.translateX%100), height);
      ctx.stroke();
    }
  }


  // Dessin Joueur
  ctx.beginPath()
  ctx.fillStyle = Me.color
  ctx.arc(Me.x+Me.translateX, Me.y+Me.translateY, Me.size, 0, 2*Math.PI)
  ctx.fill()
  // Dessin autres joueurs
  for(i=0; i<jeu.listJoueur.length; i++){
    let blob = jeu.listJoueur[i]
    if(blob.id != Me.id){
      ctx.beginPath()
      ctx.fillStyle = blob.color
      ctx.arc(blob.x+Me.translateX, blob.y+Me.translateY, blob.size, 0, 2*Math.PI)
      ctx.fill()
    }
  }


  ctx.fillStyle = "#000000"
  for(i=0; i<jeu.listBullet.length; i++){
    let bullet = jeu.listBullet[i]
    ctx.beginPath()

    ctx.arc(bullet.x+Me.translateX, bullet.y+Me.translateY, bullet.size, 0, 2*Math.PI)
    ctx.fill()
  }
  //ctx.translate(jeu.translateX, jeu.translateY)
}




window.addEventListener('load', init);
window.addEventListener('resize', resize, false);



// const getRandomColor = () => {
//   var letters = '0123456789ABCDEF';
//   var color = '#';
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }




Matrix = function(rows, cols){
  this.rows = rows
  this.cols = cols
  this.data = []
  for(let i=0; i<rows; i++){
    this.data[i] = []
    for(let j=0; j<cols; j++){
      this.data[i][j] = -1 + Math.random()*2
    }
  }
}


Matrix.prototype.add = function(x){
  this.data[0][0] += x
}

Matrix.multiply = function(m1, m2){
  let matrix = new Matrix(m1.rows, m2.cols)
  if(m1.cols != m2.rows){
    console.error('multiplication impossible')
    return
  }
  for(let i=0; i<m1.rows; i++){
    for(let j=0; j<m2.cols; j++){
      let sum = 0
      for(let k=0; k<m1.cols; k++){
        sum += m1.data[i][k] * m2.data[k][j]
      }
      matrix.data[i][j] = sum
    }
  }
  return matrix
}

NeuralNetwork = function(nbInputs, nbHidden, nbOutput){
  this.nbInputs = nbInputs
  this.nbHidden = nbHidden
  this.nbOutput = nbOutput

  // this.networkWeights = [] puis pour chaque [i] = new Matrix(nbHidden, nbInputs+1)
  this.networkWeights = new Matrix(nbHidden, nbInputs)
  this.outputWeigths = new Matrix(nbOutput, nbHidden)
}

NeuralNetwork.prototype.think = function(inputs){
  let result1 = Matrix.multiply(this.networkWeights, inputs)
  let result2 = Matrix.multiply(this.outputWeigths, result1)
  return result2
}

Matrix.toMatrix = function(inputs){
  let matrix = new Matrix(inputs.length, 1)
  for(let i=0; i<inputs.length; i++){
    matrix.data[i][0] = inputs[i]
  }
  return matrix
}
let inputs = [0, 0, 0, 1]
inputs = Matrix.toMatrix(inputs)

let nn = new NeuralNetwork(4, 2, 10)

console.table(nn.think(inputs).data)
