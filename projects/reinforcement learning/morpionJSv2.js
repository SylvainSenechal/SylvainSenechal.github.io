// To add ia training against ia

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
  for(let speed = 0; speed<50; speed++){
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
      let sameBrain = jeu.listGame[a].brain
      jeu.listGame[a] = new SingleGame("similarBrain", sameBrain)
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
  nbGames: 800, // nbGamesXaxis * nbGamesYaxis
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
  mutationRate: 0.001
}

var savedBrain = {
  brain: []
}

function saveBrain(idGame){
  for(i=0; i<9; i++){
      savedBrain.brain[i] = jeu.listGame[idGame].brain[i]
  }
}

SingleGame = function(similarBrain, sameBrain){
  this.grid = [],
  this.nextPlayer = Math.floor(1+Math.random()*2),
  this.fitness = 0
  this.probabilite = 0
  this.lastTimePlayed = 0
  this.ended = false
  this.brain = []
  if(arguments.length == 0){ // Initialisation tout debut
    for(i=0; i<9; i++){
      this.brain[i] = new Brain() // Chaque brain est rattaché à l'activation d'une case, je séléctionne la case la plus activée...
    }
  }
  else if(arguments.length == 1){ // Nouveau brain après 20 partie
    // Selection de 2 parents
    let mother = pickParent()
    let father = pickParent()

    // CrossOver de ces 2 parents pour  donner un fils
    let randomCross = Math.floor(Math.random()*mother.brain.length)
    for(m=0; m<randomCross; m++){
      this.brain[m] = mother.brain[m]
    }
    for(n=randomCross; n<mother.brain.length; n++){
      this.brain[n] = father.brain[n]
    }
    // Mutations potentielles du fils
    for(let i=0; i<this.brain.length; i++){
      //for(let j=0; j<this.brain[0].cells.length; j++){
        let rd = Math.random()
        if(rd < jeu.mutationRate){
          //this.brain[i].cells[j] += -1 + Math.random()*2
          this.brain[i] = new Brain()
        }
      //}
    }
  }
  else if(arguments.length == 2){ // brain identique pendant les 20 parties
    this.brain = sameBrain
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

Brain = function(iBrain){
  this.cells = []
  if(arguments.length == 0){
    for(b=0; b<10; b++){
      this.cells[b] = -1 + Math.random()*2
    }
  }
  // else if(arguments.length == 1){
  //   for(i=0; i<10; i++){
  //     this.cells[i] = savedBrain.brain[iBrain].cells[i] + (-1 + Math.random()*2)/3
  //   }
  // }
}

function useBrain(idGame, brain){
  let i1 = (jeu.listGame[idGame].grid[0][0]) / 2 // (val = 0||1||2) --> range = 2
  let i2 = (jeu.listGame[idGame].grid[0][1]) / 2 // (val = 0||1||2) --> range = 2
  let i3 = (jeu.listGame[idGame].grid[0][2]) / 2 // (val = 0||1||2) --> range = 2
  let i4 = (jeu.listGame[idGame].grid[1][0]) / 2 // (val = 0||1||2) --> range = 2
  let i5 = (jeu.listGame[idGame].grid[1][1]) / 2 // (val = 0||1||2) --> range = 2
  let i6 = (jeu.listGame[idGame].grid[1][2]) / 2 // (val = 0||1||2) --> range = 2
  let i7 = (jeu.listGame[idGame].grid[2][0]) / 2 // (val = 0||1||2) --> range = 2
  let i8 = (jeu.listGame[idGame].grid[2][1]) / 2 // (val = 0||1||2) --> range = 2
  let i9 = (jeu.listGame[idGame].grid[2][2]) / 2 // (val = 0||1||2) --> range = 2
  let bias = 1
  return i1*brain.cells[0] + i2*brain.cells[1] + i3*brain.cells[2] +
          i4*brain.cells[3] + i5*brain.cells[4] + i6*brain.cells[5] +
          i7*brain.cells[6] + i8*brain.cells[7] + i9*brain.cells[8] + bias*brain.cells[9]
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
  let g = []
  for(i=0; i<3; i++){
    g[i] = []
    for(j=0; j<3; j++){
      let br = jeu.listGame[idGame].brain[i*3+j]
      if(jeu.listGame[idGame].grid[i][j] == 0){
        g[i][j] = ({vide: true, valBrain: useBrain(idGame, br)})
      }
      else{
        g[i][j] = ({vide: false, valBrain: useBrain(idGame, br)})
      }
    }
  }

  let best = {
    valI: 0,
    valJ: 0
  }
  let maxBrain = -10000

  for(i=0; i<3; i++){
    for(j=0; j<3; j++){
      if(g[i][j].vide == true && g[i][j].valBrain > maxBrain){ // case jouable
        best.valI = i
        best.valJ = j
        maxBrain = g[i][j].valBrain
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
