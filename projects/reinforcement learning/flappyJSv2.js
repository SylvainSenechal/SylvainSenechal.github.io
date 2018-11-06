// Afficher le nombre de morts/initial
// !! w1 > 1 trouvé..


class Matrix {
  constructor(rows, cols){
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

  map(func){
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let val = this.data[i][j];
        this.data[i][j] = func(val);
      }
    }
  }

  static multiply(m1, m2){
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

  static toMatrix(array){
    let matrix = new Matrix(array.length, 1)
    for(let i=0; i<array.length; i++){
      matrix.data[i][0] = array[i]
    }
    return matrix
  }

  copy(){
    let m = new Matrix(this.rows, this.cols);
    for (let i=0; i<this.rows;i++) {
      for (let j=0; j<this.cols;j++) {
        m.data[i][j] = this.data[i][j];
      }
    }
    return m;
  }

  mutate(mutationRate){
    for (let i=0; i<this.rows; i++) {
      for (let j=0; j<this.cols; j++) {
        let rdm = Math.random()
        if(rdm < mutationRate){
          this.data[i][j] = -1 + Math.random()*2
        }
      }
    }
  }
}
// Faire une classe genetic algo avec proba, pick parent etc
class NeuralNetwork {
  constructor(nbInputs, nbHidden, nbOutput) {
    if(nbInputs instanceof NeuralNetwork){
      let nn = nbInputs
      this.nbInputs = nn.nbInputs
      this.nbHidden = nn.nbHidden
      this.nbOutput = nn.nbOutput
      this.hiddenWeights = nn.hiddenWeights.copy()
      this.outputWeigths = nn.outputWeigths.copy()
    }
    else{
      this.nbInputs = nbInputs
      this.nbHidden = nbHidden
      this.nbOutput = nbOutput
      // this.networkWeights = [] puis pour chaque [i] = new Matrix(nbHidden, nbInputs+1)
      this.hiddenWeights = new Matrix(nbHidden, nbInputs)
      this.outputWeigths = new Matrix(nbOutput, nbHidden)
    }
  }
  copy(){
    return new NeuralNetwork(this);
  }
  mutate(mutationRate){
    this.hiddenWeights.mutate(mutationRate)
    this.outputWeigths.mutate(mutationRate)
  }

  draw(context, inputs){
    ctx.clearRect(0, 950, 1000, 1200)
    ctx.font = "10px Comic Sans MS"
    inputs.forEach( (elem, index) => ctx.strokeText(elem.toFixed(3), 50, 1000 + index*25))
  }
}
// ctx.beginPath()
// ctx.arc(bird.x + jeu.positionX, bird.y + jeu.positionX, bird.size, 0, 2*Math.PI)
// ctx.fill()
// ctx.strokeText("Score : " + jeu.score, 50, 40)

const sigmoid = x => 1 / (1 + Math.exp(-x));
const relu = x => x < 0 ? 0 : x
const step = x => x < 0 ? 0 : 1
const identity = x => x
// Mettre les functions d'activations en this. du nn
NeuralNetwork.prototype.think = function(inputs){
  let result1 = Matrix.multiply(this.hiddenWeights, inputs)
  result1.map(identity)
  let result2 = Matrix.multiply(this.outputWeigths, result1)
  result2.map(identity)
  return result2
}

//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', init)
var ctx, canvas
var width, height
function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
  createBirds()
  loop()
}

var cpt = 0
function loop(){ // Voir l'ordre des fonctions
	createPipes()
  cpt++
//  if(cpt % 5 === 0)
  gravity()
  updatePipesPosition()
  removePastPipes() // attention a l'ordre collision et remove pipes
  collisions()
  updateScore()

  restoreGame()
  dessin()

  requestAnimationFrame(loop)
}

var jeu = {
	width: 900,
  pipeWidth: 900/10,
	height: 900, // base 600
	positionX: 50,
	positionY: 50,
	lastPipeCreated: 0,
  startingHolePipe: 0.8,
  holePipe: 0.8,
	holePipeMin: 0.10, // %of the pipe cut off, usually 30%
  holePipeDecreaseRate: 0.8,
	listePipes: [],
  listeBird: [],
  listDeadBirds: [],
	speed: 3,
	score: 0,
  gravityPower: 0.7,
  scoreBetweenPipes : 400, // base 300
  nbBirds: 200,
  maxDrawnBird: 200,
  nbGeneration: 1,
  mutationRate: 0.1
}

function useBrain(bird, indexBird){
  // inputs = [yBird, yTopPipe, yBottomPipe, birdSpeed] + normalize
  // Sur inputs dst du pipe ajouter la largeur du pipe
  // Voir problème du hole pipe qui retrecis et qui fausse l'inputs
  // Retirer le hole pipe qui retrecis et faire sauter oiseau plus lentement
  let inputs = [
    (bird.y-bird.size) / (jeu.height-(2*bird.size)),
    (jeu.listePipes[0].height1) / (jeu.height*(1-jeu.holePipe)),
    (jeu.listePipes[0].height2) / (jeu.height*(1-jeu.holePipe)),
    (bird.birdVertSpeed+15) / (30), // (Speed/rangeSpeed)
    (jeu.listePipes[0].x-bird.x) / (jeu.width) //(entre 100 et 950)->850 (oiseauX maxXpipe)
    // 1 BIAS ???
  ]
  if(indexBird === 0) bird.brain.draw(ctx, inputs)
  inputs = Matrix.toMatrix(inputs)
  let results = bird.brain.think(inputs).data
  return results[0][0]
}

Bird = function(fromParent){
  this.size = 25
	this.x = 50
	this.y = this.size + Math.random()*(jeu.height - 2*this.size)
  this.birdVertSpeed = 0
  this.fitness = 0
  this.probability = 0
  this.collision = false
  this.color = getRandomColor()
  if(!fromParent){
    this.brain = new NeuralNetwork(5, 4, 1)
  }
  else{
    // Selection d'un parent
    let mother = pickParent()
    this.brain = mother
    this.brain.mutate(jeu.mutationRate)
  }
}

Tuyau = function(){
  jeu.holePipe = jeu.holePipe * jeu.holePipeDecreaseRate
  if(jeu.holePipe < jeu.holePipeMin) jeu.holePipe = jeu.holePipeMin
//  jeu.holePipe = jeu.holePipeMin // A RETIRER
  let h1Part   = Math.random() * (1-jeu.holePipe)

  this.x       = jeu.width
  this.width   = jeu.pipeWidth
	this.height1 = jeu.height*h1Part
	this.height2 = jeu.height - this.height1 - jeu.holePipe*jeu.height
  this.y1      = 0
  this.y2      = jeu.height - this.height2
}

function calculateFitness() {
  let minFit = 1000000
  for(let i=0; i<jeu.nbBirds; i++){
    // reduction des ecarts de fitness avec minFit:
    if(jeu.listDeadBirds[i].fitness < minFit) minFit = jeu.listDeadBirds[i].fitness
  }
  jeu.listDeadBirds.forEach(elem => elem.fitness -= minFit)

  // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
  for(let i=0; i<jeu.nbBirds; i++){
    jeu.listDeadBirds[i].fitness = Math.pow(jeu.listDeadBirds[i].fitness, 4)
  }
}

function calculateProbability(){
  let sum = 0
  for(let i=0; i<jeu.nbBirds; i++){
    sum += jeu.listDeadBirds[i].fitness
  }
  for(let i=0; i<jeu.nbBirds; i++){
    jeu.listDeadBirds[i].probability = jeu.listDeadBirds[i].fitness / sum
  }
  //jeu.listDeadBirds.forEach(elem => console.log(elem.probability))
}

function pickParent(){
  let index = 0
  let rdm = Math.random()
  while( rdm > 0){
    rdm = rdm - jeu.listDeadBirds[index].probability
    index++
  }
  index--
  return jeu.listDeadBirds[index].brain.copy()
}

function restoreGame(){
  if(jeu.listeBird.length == 0){
    jeu.lastPipeCreated = 0
    jeu.listePipes = []
    jeu.listeBird = []
    jeu.score = 0
    jeu.nbGeneration++
    jeu.holePipe = jeu.startingHolePipe

    calculateFitness()
    calculateProbability()
    createNewGenBirds()
    jeu.listDeadBirds = []
  }
}
function createNewGenBirds(){
  for(i=0; i<jeu.nbBirds; i++){
    jeu.listeBird.push(new Bird("fromParent"))
  }
}
function createBirds(){
  for(i=0; i<jeu.nbBirds; i++){
    jeu.listeBird.push(new Bird())
  }
}
function updateScore(){
  jeu.score += jeu.speed
}

function createPipes(){
	if(jeu.lastPipeCreated + jeu.scoreBetweenPipes < jeu.score ){
		jeu.listePipes.push(new Tuyau())
		jeu.lastPipeCreated = jeu.score
	}
}
function updatePipesPosition(){
  for (p of jeu.listePipes) {
		p.x -= jeu.speed
	}
}
function removePastPipes(){
  if(jeu.listePipes.length>0){ // Car au tout debut y'a aucun pipes
  let bird = jeu.listeBird[0]
    if((bird.x-jeu.listePipes[0].x) > (jeu.listePipes[0].width+bird.size)){
      jeu.listePipes.splice(0,1)
  	}
  }
}

function collisions(){
  if(jeu.listePipes.length>0){ // Si on a 1 pipes devant nous présent (pas le cas au début)

    var midPipe = jeu.listePipes[0].x + (jeu.listePipes[0].width/2)
    var widthHalfPipe = midPipe-jeu.listePipes[0].x
    for(bird of jeu.listeBird){
      if (Math.abs(midPipe - bird.x) < (bird.size+widthHalfPipe)){ // Si on est au niveau du pipe
        if ( (bird.y - bird.size) < (jeu.listePipes[0].height1) // Si on est sur le haut
        || ( (bird.y + bird.size) > (jeu.listePipes[0].y2) )){ // Ou le bas du pipe, collision
          bird.collision = true
        }
      }
    }
  }
  for(i=0; i<jeu.listeBird.length; i++){
    if(jeu.listeBird[i].collision){
      jeu.listeBird[i].fitness = jeu.score
      jeu.listDeadBirds.push(jeu.listeBird[i])
      // if(jeu.listeBird.length == 1){
      //   console.table(jeu.listeBird[0].brain.hiddenWeights.data)
      // }
      jeu.listeBird.splice(i, 1)
    }
  }
}

function gravity(){
  jeu.listeBird.forEach((bird, indexBird) => {
    bird.birdVertSpeed += jeu.gravityPower
  	if(bird.birdVertSpeed > 15){
  		bird.birdVertSpeed = 15
  	}

    if(jeu.listePipes.length>=1){ // on a besoin d'un pipe à prendre en entrée pour useBrain
      if(useBrain(bird, indexBird) >= 0.0){
    		if(bird.birdVertSpeed > 0){
    			bird.birdVertSpeed = 0
    		}
    		bird.birdVertSpeed -= 1
    	}
    }
    else{
      if(Math.random() > 0.5){
        if(bird.birdVertSpeed > 0){
    			bird.birdVertSpeed = 0
    		}
        bird.birdVertSpeed -= 0.9
      }
    }

  	if(bird.birdVertSpeed < -15){
  			bird.birdVertSpeed = -15
  	}
  	bird.y += bird.birdVertSpeed
  	if(bird.y > jeu.height - bird.size ){
  		bird.y = jeu.height - bird.size
  	}
  	else if(bird.y < bird.size){
  		bird.y = bird.size
  	}
  })
}

function dessin(){
	// ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.clearRect(0, 0, jeu.width+200, jeu.height+jeu.positionY+1)
	ctx.fillStyle = "#83f442"
	for (p of jeu.listePipes) {
		ctx.fillRect(p.x + jeu.positionX, p.y1 + jeu.positionY, p.width, p.height1) // top pipe
		ctx.fillRect(p.x + jeu.positionX, p.y2 + jeu.positionY, p.width, p.height2) // bottom pipe
	}

  if(jeu.listeBird.length>jeu.maxDrawnBird){
    for(i=0; i<jeu.maxDrawnBird; i++){
      ctx.fillStyle = jeu.listeBird[i].color
      ctx.beginPath()
    	ctx.arc(jeu.listeBird[i].x + jeu.positionX, jeu.listeBird[i].y + jeu.positionY, jeu.listeBird[i].size, 0, 2*Math.PI)
    	ctx.fill()
    }
  }
  else{
    for(bird of jeu.listeBird){
      ctx.fillStyle = bird.color
      ctx.beginPath()
    	ctx.arc(bird.x + jeu.positionX, bird.y + jeu.positionX, bird.size, 0, 2*Math.PI)
    	ctx.fill()
    }
  }

  ctx.font = "40px Comic Sans MS"
	ctx.strokeText("Score : " + jeu.score, 50, 40)
  ctx.strokeText("Generation : " + jeu.nbGeneration, 350, 40)
	ctx.strokeRect(jeu.positionX, jeu.positionY, jeu.width, jeu.height); // Cadre noir du jeu
}





document.onkeypress = function(e){
	if(e.keyCode == 32){
    console.log("restoring game")
    jeu.listeBird = []
    restoreGame()
	}
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
