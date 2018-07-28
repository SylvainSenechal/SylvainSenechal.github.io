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

  initPopulation()
  loop()
}

function loop(){ // Voir l'ordre des fonctions
  //dessin()
  for(let speed = 0; speed<1; speed++){
    calculateFitness()
    printData()
    calculateProbability()
    mateNewPopulation()

    Global.nbGeneration++
  }
  requestAnimationFrame(loop);
}

// // reduction des ecarts :
// let minFit = Math.min(...jeu.listFitness)
// jeu.listFitness = jeu.listFitness.map(elem => elem -= minFit)
// // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
// for(let a=0; a<jeu.listGame.length; a++){
//   jeu.listFitness[a] = Math.pow(jeu.listFitness[a], 4)
//   //jeu.listFitness[a] = Math.pow(1.05, jeu.listFitness[a])
//   //console.log(jeu.listFitness[a])
// }
// calculateProbability()

var Global = {
  Target: 'Je suis a deviner si tu peux mais tu pourra pas me trouver meme en cherchant tres fort^^ eh oui je suis l introuvable qui finira peut-etre par etre trouve',
  populationSize: 500,
  population: [],
  nbGeneration: 1,
  maxFitness: 0,
  mutationRate: 0.01
}

// function printData(){
//   console.log("Played matchs : " + jeu.matchPlayed)
//   console.log("Max won: " + Math.max(...jeu.listWon))
//   console.log("Max lost: " + Math.max(...jeu.listLost))
//   console.log("Max null: " + Math.max(...jeu.listNoWon))
//   console.log("Fitness Max : " + Math.max(...jeu.listFitness))
//   console.log('fitness min : ' + Math.min(...jeu.listFitness))
//   let cpt = 0
//   for(i=0; i<jeu.nbGames; i++){
//     cpt += jeu.listFitness[i]
//   }
//   console.log("Fitness Avg : " + (cpt/jeu.nbGames))
//   console.log("Total played : " + jeu.totalPlayed)
//   console.log("% Gagnes : " + jeu.j1Won/jeu.totalPlayed*100)
//   console.log("% Perdus : " + jeu.j2Won/jeu.totalPlayed*100)
//   console.log("% Null : "   + jeu.noWin/jeu.totalPlayed*100)
//   console.log("")
// }


function printData(){
  let maxFit = 0
  let indexMax = 0
  for(let i=0; i<Global.populationSize; i++){
    if(Global.population[i].fitness > maxFit){
      maxFit = Global.population[i].fitness
      indexMax = i
    }
  }
  let bestResult = ""
  Global.population[indexMax].genes.forEach( elem => bestResult += elem)
  console.log(bestResult)
}

function initPopulation(){
  for(let i=0; i<Global.populationSize; i++){
    Global.population[i] = new DNA()
  }
}

function mateNewPopulation(){
  let tmp =[]
  for(let i=0; i<Global.populationSize; i++){
    tmp[i] = new DNA('similarDNA')
  }
  Global.population = tmp
}


function createGenes() {
  let genes = []
  for(let i=0; i<Global.Target.length; i++){ // Ne pas utiliser target length mais des sizes au hasard
                                            // avec -1 fitness par size trop longue ?
    genes[i] = createPartOfGene()
  }
  return genes
}
function createPartOfGene() {
  let ascii = Math.floor(Math.random()*128) //Math.floor(Math.random()*59+64) // 64 a 122
  //if (ascii == 64) ascii = 32
  return String.fromCharCode(ascii)
}
DNA = function(similarDNA){
  this.genes = []
  this.fitness = 0
  this.probability = 0
  if(arguments.length == 0){ // Initialisation tout debut
    this.genes = createGenes()
  }
  else if(arguments.length == 1){
    // Selection de 2 parents
    let mother = pickParent()
    let father = pickParent()
    // CrossOver de ces 2 parents pour  donner un fils
    let randomCross = Math.floor(Math.random()*mother.genes.length)
    for(let m=0; m<randomCross; m++){
      this.genes[m] = mother.genes[m]
    }
    for(let n=randomCross; n<mother.genes.length; n++){
      this.genes[n] = father.genes[n]
    }
    // Mutations potentielles du fils
    for(let i=0; i<this.genes.length; i++){
      let rd = Math.random()
      if(rd < Global.mutationRate){
        this.genes[i] = createPartOfGene()
      }
    }
  }
}

function calculateFitness() {
  let minFit = 10000
  for(let i=0; i<Global.populationSize; i++){
    for(let j=0; j<Global.Target.length; j++){
      if(Global.population[i].genes[j] == Global.Target[j]){
        Global.population[i].fitness++
      }
    }
    // reduction des ecarts ed fitness avec minFit:
    if(Global.population[i].fitness < minFit) minFit = Global.population[i].fitness
  }
  Global.population.forEach(elem => elem.fitness -= minFit)

  // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
  for(let i=0; i<Global.populationSize; i++){
    Global.population[i].fitness = Math.pow(Global.population[i].fitness, 4)
    //jeu.listFitness[a] = Math.pow(1.05, jeu.listFitness[a])
  }
}

function calculateProbability(){
  let sum = 0
  for(let i=0; i<Global.populationSize; i++){
    sum += Global.population[i].fitness
  }
  for(let i=0; i<Global.populationSize; i++){
    Global.population[i].probability = Global.population[i].fitness / sum
  }
}

function pickParent(){
  let index = 0
  let rdm = Math.random()
  while( rdm > 0){
    rdm = rdm - Global.population[index].probability
    index++
  }
  index--
  return Global.population[index]
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
