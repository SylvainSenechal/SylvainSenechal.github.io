// To add ia training against ia


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


Matrix.prototype.map = function(func) {
  for (let i = 0; i < this.rows; i++) {
    for (let j = 0; j < this.cols; j++) {
      let val = this.data[i][j];
      this.data[i][j] = func(val);
    }
  }
}
function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
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

Matrix.toMatrix = function(inputs){
  let matrix = new Matrix(inputs.length, 1)
  for(let i=0; i<inputs.length; i++){
    matrix.data[i][0] = inputs[i]
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
function max(x) {
  return  Math.max(0, x)
}
function step(x) {
  if(x<0) return 0
  else return 1
}

NeuralNetwork.prototype.think = function(inputs){
  let result1 = Matrix.multiply(this.networkWeights, inputs)
  result1.map(max)
  let result2 = Matrix.multiply(this.outputWeigths, result1)
  result2.map(max)
  return result2
}

//////////////////////////////////////////////////////////////////////////////////////////
window.addEventListener('load', init);
var ctx, canvas
var width, height

function init(){
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  width = window.innerWidth
  height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  initGame()
  loop()
}

function loop(){ // Voir l'ordre des fonctions
  dessin()
  for(let speed = 0; speed<30; speed++){
    allowingPlay()
    resultGame()
  }
  requestAnimationFrame(loop);
}

function initGame(){
  jeu.matchPlayed = 1
  jeu.totalPlayed = jeu.nbGames
  for(a=0; a<jeu.nbGames; a++){
    jeu.listGame[a] = new SingleGame()
    jeu.listWon[a] = 0
    jeu.listLost[a] = 0
    jeu.listNoWon[a] = 0
    jeu.listFitness[a] = 0
    for(i=0; i<3; i++){
      jeu.listGame[a].grid[i] = []
      for(j=0; j<3; j++){
        jeu.listGame[a].grid[i][j] = 0
      }
    }
  }
}

function restoreGame(){
  if(jeu.matchPlayed == jeu.gamesBeforeNewGen){ // Total restore with similar best brain
    printData()
    jeu.matchPlayed = 1
    jeu.totalPlayed = jeu.nbGames

    jeu.j1Won = 0 // total won by IA
    jeu.j2Won = 0 // total won by random Player
    jeu.noWin = 0

    // let maxFitness = - 10000
    // let iFitness = 0
    // for(i=0; i<jeu.nbGames; i++){
    //   if(jeu.listFitness[i] > maxFitness){
    //     iFitness = i
    //     maxFitness = jeu.listFitness[i]
    //   }
    // }
    // saveBrain(iFitness)
    // console.log(JSON.stringify(savedBrain.brain))

    // reduction des ecarts :
    let minFit = Math.min(...jeu.listFitness)
    jeu.listFitness = jeu.listFitness.map(elem => elem -= minFit)
    // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
    for(let a=0; a<jeu.listGame.length; a++){
      jeu.listFitness[a] = Math.pow(jeu.listFitness[a], 4)
      //jeu.listFitness[a] = Math.pow(1.05, jeu.listFitness[a])
      //console.log(jeu.listFitness[a])
    }
    calculateProbability()
    for(a=0; a<jeu.nbGames; a++){
      jeu.listGame[a] = new SingleGame("similarBrain")
      jeu.listWon[a] = 0
      jeu.listLost[a] = 0
      jeu.listNoWon[a] = 0
      jeu.listFitness[a] = 0
      for(i=0; i<3; i++){
        jeu.listGame[a].grid[i] = []
        for(j=0; j<3; j++){
          jeu.listGame[a].grid[i][j] = 0
        }
      }
    }
  }
  else{ // fake restore
    jeu.matchPlayed++
    jeu.totalPlayed += jeu.nbGames
    for(a=0; a<jeu.nbGames; a++){
      let nn = jeu.listGame[a].nn
      jeu.listGame[a] = new SingleGame("similarBrain", nn)
      for(i=0; i<3; i++){
        jeu.listGame[a].grid[i] = []
        for(j=0; j<3; j++){
          jeu.listGame[a].grid[i][j] = 0
        }
      }
    }
  }
}

function printData(){
  console.log("Played matchs : " + jeu.matchPlayed)
  console.log("Max won: " + Math.max(...jeu.listWon))
  console.log("Max lost: " + Math.max(...jeu.listLost))
  console.log("Max null: " + Math.max(...jeu.listNoWon))
  console.log("Fitness Max : " + Math.max(...jeu.listFitness))
  console.log('fitness min : ' + Math.min(...jeu.listFitness))
  let cpt = 0
  for(i=0; i<jeu.nbGames; i++){
    cpt += jeu.listFitness[i]
  }
  console.log("Fitness Avg : " + (cpt/jeu.nbGames))
  console.log("Total played : " + jeu.totalPlayed)
  console.log("% Gagnes : " + jeu.j1Won/jeu.totalPlayed*100)
  console.log("% Perdus : " + jeu.j2Won/jeu.totalPlayed*100)
  console.log("% Null : "   + jeu.noWin/jeu.totalPlayed*100)
  console.log("")
}

var jeu = {
  widthCase: 11,
  nbGamesXaxis: 20, // 20 idéal
  nbGamesYaxis: 20, // 20 idéal
  grid: [],
  nbGames: 400, // nbGamesXaxis * nbGamesYaxis
  listGame: [],
  listWon: [],
  listNoWon: [],
  listLost: [],
  listFitness: [],
  nextPlayer: 0,
	positionX: 50,
	positionY: 50,

  j1Won: 0, // total won by IA
  j2Won: 0, // total won by random Player
  noWin: 0, // total null match
  totalPlayed: 0,
  matchPlayed: 0,

  score: 0,
  nbGeneration: 1,
  maxFitness: 0,
  gamesBeforeNewGen: 100,
  mutationRate: 0.000001
}

var savedBrain = {
  brain: []
}
console.log('voir pourquoi plus de victoires des le debut')
function saveBrain(idGame){
  for(i=0; i<9; i++){
      savedBrain.brain[i] = jeu.listGame[idGame].brain[i]
  }
}

SingleGame = function(similarBrain, nn){
  this.grid = [],
  this.nextPlayer = Math.floor(1+Math.random()*2),
  this.fitness = 0
  this.probabilite = 0
  this.lastTimePlayed = 0
  this.ended = false
  if(arguments.length == 0){ // Initialisation tout debut
    for(i=0; i<9; i++){
      this.nn = new NeuralNetwork(10, 9, 9) // Chaque brain est rattaché à l'activation d'une case, je séléctionne la case la plus activée...
    }
  }
  else if(arguments.length == 1){ // Nouveau brain après 20 partie
    // Selection de 2 parents
    let mother = pickParent()
    let father = pickParent()

    // CrossOver de ces 2 parents pour  donner un fils

    // Valable car nbHidden = nbOutput
    this.nn = new NeuralNetwork(10, 9, 9)
    // let randomCross = Math.floor(Math.random()*mother.nn.networkWeights.rows)
    // for(let m=0; m<randomCross; m++){
    //   this.nn.networkWeights.data[m] = mother.nn.networkWeights.data[m]
    // }
    // for(let n=randomCross; n<mother.nn.networkWeights.rows; n++){
    //   this.nn.networkWeights.data[n] = father.nn.networkWeights.data[n]
    // }
    // randomCross = Math.floor(Math.random()*mother.nn.outputWeigths.rows)
    // for(let m=0; m<randomCross; m++){
    //   this.nn.outputWeigths.data[m] = mother.nn.outputWeigths.data[m]
    // }
    // for(let n=randomCross; n<mother.nn.outputWeigths.rows; n++){
    //   this.nn.outputWeigths.data[n] = father.nn.outputWeigths.data[n]
    // }
    for(let m=0; m<mother.nn.networkWeights.rows; m++){
      if(Math.random()>0.5){
        this.nn.networkWeights.data[m] = mother.nn.networkWeights.data[m]
        this.nn.outputWeigths.data[m] = mother.nn.networkWeights.data[m]
      }
      else{
        this.nn.networkWeights.data[m] = father.nn.networkWeights.data[m]
        this.nn.outputWeigths.data[m] = father.nn.networkWeights.data[m]
      }
    }

    // Mutations potentielles du fils
    for(let i=0; i<this.nn.networkWeights.rows; i++){
      for(let j=0; j<this.nn.networkWeights.cols; j++){
        let rd = Math.random()
        if(rd < jeu.mutationRate){
          this.nn.networkWeights.data[i][j] = -1 + Math.random()*2
        }
      }
    }
    for(let i=0; i<this.nn.outputWeigths.rows; i++){
      for(let j=0; j<this.nn.outputWeigths.cols; j++){
        let rd = Math.random()
        if(rd < jeu.mutationRate){
          this.nn.outputWeigths.data[i][j] = -1 + Math.random()*2
        }
      }
    }
  }
  else if(arguments.length == 2){ // brain identique pendant les 20 parties
    this.nn = nn
  }
}

var copyListFitness = []
var copyListGames = []
function calculateProbability(){
  for(let k=0; k<jeu.listGame.length; k++){
    copyListFitness[k] = jeu.listFitness[k]
    copyListGames[k] = jeu.listGame[k]
  }
  let sum = 0
  for(let a=0; a<jeu.listGame.length; a++){
    sum += copyListFitness[a]
  }
  for(let a=0; a<jeu.listGame.length; a++){
    copyListGames[a].probabilite = copyListFitness[a] / sum
  }
}

function pickParent(){
  let index = 0
  let rdm = Math.random()
  while( rdm > 0){
    rdm = rdm - copyListGames[index].probabilite
    index++
  }
  index--
  return copyListGames[index]
}

function allowingPlay(){
  for(a=0; a<jeu.nbGames; a++){
    if(jeu.listGame[a].ended == false){
      if(jeu.listGame[a].nextPlayer == 1 ){
        playComputer1(a)
      }
      else if(jeu.listGame[a].nextPlayer == 2 ){
        playComputer2(a)
      }
    }
  }
}

function playComputer1(idGame){
  // Ia :
  let inputs = [
    (jeu.listGame[idGame].grid[0][0]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[0][1]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[0][2]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[1][0]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[1][1]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[1][2]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[2][0]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[2][1]) / 2, // (val = 0||1||2) --> range = 2
    (jeu.listGame[idGame].grid[2][2]) / 2, // (val = 0||1||2) --> range = 2
    1
  ]
  inputs = Matrix.toMatrix(inputs)
  let results = jeu.listGame[idGame].nn.think(inputs).data
  let best = {
    valI: 0,
    valJ: 0
  }
  // console.log(inputs)
  // console.table(results)
  // console.log(ok)
  let maxBrain = -10000

  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(jeu.listGame[idGame].grid[i][j] == 0 && results[i*3+j] > maxBrain){ // case jouable
        best.valI = i
        best.valJ = j
        maxBrain = results[i*j]
      }
    }
  }

  jeu.listGame[idGame].grid[best.valI][best.valJ] = 1
  jeu.listGame[idGame].nextPlayer = 2
}

function playComputer2(idGame){
  let listePlayable = []
  // Joueur aléatoire :
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(jeu.listGame[idGame].grid[i][j] == 0){ // case jouable
        listePlayable.push({valI: i, valJ: j})
      }
    }
  }
  let playedCase = Math.floor(Math.random()*listePlayable.length)
  jeu.listGame[idGame].grid[listePlayable[playedCase].valI][listePlayable[playedCase].valJ] = 2

  jeu.listGame[idGame].nextPlayer = 1
  jeu.listGame[idGame].lastTimePlayed = performance.now()
}

function calculateFitness(idGame, valCheckWon){ // A revoir
  if(valCheckWon == 0){ // Si match null, fitness = 10
    jeu.listGame[idGame].fitness = 10 // 10
    //return 10
    return 10
  }
  if(valCheckWon == 1){ // Si j'ai gagné, je veux gagner avec le moins de coups possibles
    let fitness = 30
    let cpt = 9
    for(i=0; i<3; i++){
      for(j=0; j<3; j++){
        if(jeu.listGame[idGame].grid[i][j] != 0){
          cpt--
        }
      }
    }
    fitness += cpt
    jeu.listGame[idGame].fitness = fitness
    return fitness
    //return 6
  }
  if(valCheckWon == 2){
    let fitness = 0
    let cpt = 0
    for(i=0; i<3; i++){
      for(j=0; j<3; j++){
        if(jeu.listGame[idGame].grid[i][j] != 0){
          cpt++
        }
      }
    }
    fitness += cpt // plus on a mis de temps a PERDE plus on augmente la fitness
    jeu.listGame[idGame].fitness = fitness
    return fitness
    //return 0
  }
}

function resultGame(){
  for(a=0; a<jeu.nbGames; a++){
    if(checkWon(a) == 0 && jeu.listGame[a].ended == false){
      jeu.listFitness[a] += calculateFitness(a, 0)
      jeu.listGame[a].ended = true
      jeu.listNoWon[a]++
      jeu.noWin++
    }
    else if(checkWon(a) == 1 && jeu.listGame[a].ended == false){
      jeu.listFitness[a] += calculateFitness(a, 1)
      jeu.listGame[a].ended = true
      jeu.listWon[a]++
      jeu.j1Won++
    }
    else if(checkWon(a) == 2 && jeu.listGame[a].ended == false){
      jeu.listFitness[a] += calculateFitness(a, 2)
      jeu.listGame[a].ended = true
      jeu.listLost[a]++
      jeu.j2Won++
    }
  }

  let cpt = 0
  for(a=0; a<jeu.nbGames; a++){
    if(jeu.listGame[a].ended == true){
      cpt++
    }
  }
  if(cpt == jeu.nbGames){
    restoreGame()
  }
}

function checkWon(idGame){
  // Player win :
  if(jeu.listGame[idGame].grid[0][0] == 1 && jeu.listGame[idGame].grid[1][1] == 1 && jeu.listGame[idGame].grid[2][2] == 1){ // Diago 1
    return 1
  }
  if(jeu.listGame[idGame].grid[0][2] == 1 && jeu.listGame[idGame].grid[1][1] == 1 && jeu.listGame[idGame].grid[2][0] == 1){ // Diago 2
    return 1
  }
  for(i=0; i<3; i++){
    if(jeu.listGame[idGame].grid[i][0] == 1 && jeu.listGame[idGame].grid[i][1] == 1 && jeu.listGame[idGame].grid[i][2] == 1){ // 3 lignes
      return 1
    }
    if(jeu.listGame[idGame].grid[0][i] == 1 && jeu.listGame[idGame].grid[1][i] == 1 && jeu.listGame[idGame].grid[2][i] == 1){ // 3 colonnes
      return 1
    }
  }
  // Computer win :
  if(jeu.listGame[idGame].grid[0][0] == 2 && jeu.listGame[idGame].grid[1][1] == 2 && jeu.listGame[idGame].grid[2][2] == 2){ // Diago 1
    return 2
  }
  if(jeu.listGame[idGame].grid[0][2] == 2 && jeu.listGame[idGame].grid[1][1] == 2 && jeu.listGame[idGame].grid[2][0] == 2){ // Diago 2
    return 2
  }
  for(i=0; i<3; i++){
    if(jeu.listGame[idGame].grid[i][0] == 2 && jeu.listGame[idGame].grid[i][1] == 2 && jeu.listGame[idGame].grid[i][2] == 2){ // 3 lignes
      return 2
    }
    if(jeu.listGame[idGame].grid[0][i] == 2 && jeu.listGame[idGame].grid[1][i] == 2 && jeu.listGame[idGame].grid[2][i] == 2){ // 3 colonnes
      return 2
    }
  }
  // Match null :
  let cpt = 0
  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(jeu.listGame[idGame].grid[i][j] == 1 || jeu.listGame[idGame].grid[i][j] == 2){
        cpt++
      }
    }
  }
  if(cpt == 9){
    return 0
  }
  // Still on :
  return -1
}



function dessin(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  for(u=0; u<jeu.nbGamesXaxis; u++){
    for(v=0; v<jeu.nbGamesYaxis; v++){
      for(i=0; i<3; i++){
        for(j=0; j<3; j++){
          ctx.strokeRect(jeu.positionX+i*jeu.widthCase + u*jeu.widthCase*4, jeu.positionY+j*jeu.widthCase + v*jeu.widthCase*4, jeu.widthCase, jeu.widthCase);
        }
      }
    }
  }

  for(u=0; u<jeu.nbGamesXaxis; u++){
    for(v=0; v<jeu.nbGamesYaxis; v++){
      for(i=0; i<3; i++){
        for(j=0; j<3; j++){
          if(jeu.listGame[(u*10)+v].grid[j][i] == 1){
            ctx.strokeStyle = "#00ff00"
            ctx.beginPath()
            ctx.arc(jeu.positionX+i*jeu.widthCase + jeu.widthCase/2 + u*jeu.widthCase*4, jeu.positionY+j*jeu.widthCase + jeu.widthCase/2 + v*jeu.widthCase*4, jeu.widthCase/4, 0, 2*Math.PI)
          	ctx.stroke()
          }
          if(jeu.listGame[(u*10)+v].grid[j][i] == 2){
            ctx.strokeStyle = "#ff0000"
            ctx.strokeRect(jeu.positionX+i*jeu.widthCase + jeu.widthCase/4 + u*jeu.widthCase*4, jeu.positionY+j*jeu.widthCase + jeu.widthCase/4 + v*jeu.widthCase*4, jeu.widthCase/2, jeu.widthCase/2);
          }
        }
      }
    }
  }

  ctx.strokeStyle = "#000000"
  ctx.strokeText("J1Won : " + jeu.j1Won, 50, 40)
  ctx.strokeText("J2Won : " + jeu.j2Won, 350, 40)
  ctx.strokeText("Matchs null : " + jeu.noWin, 700, 40)
}
