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

  initListNumber()
  initPopulation()
  loop()
}

function loop(){ // Voir l'ordre des fonctions
  //dessin()
  if(!Global.trouve){
    for(let speed = 0; speed<1; speed++){
      calculateFitness()
      printData()
      calculateProbability()
      mateNewPopulation()

      Global.nbGeneration++
    }
  }
  else{
    printBestData()
  }

  requestAnimationFrame(loop);
}

var Global = {
  listNumber: [],
  sizeListNumber: 20,
  sumListNumber: 0,
  populationSize: 100,
  population: [],
  nbGeneration: 1,
  maxFitness: 0,
  mutationRate: 0.02,
  trouve: false,

  best: null,
}

function printData(){
  let maxFit = 0
  let indexMax = 0
  for(let i=0; i<Global.populationSize; i++){
    if(Global.population[i].fitness > maxFit){
      maxFit = Global.population[i].fitness
      indexMax = i
    }
  }
  Global.best = Global.population[indexMax]
  if(Global.population[indexMax].sum1 === Global.population[indexMax].sum2) Global.trouve = true
  console.log("Sum 1 Best : " + Global.population[indexMax].sum1)
  console.log("Sum 2 Best : " + Global.population[indexMax].sum2)
  console.log("Best fitness : " + Global.population[indexMax].fitness)
}
function printBestData(){
  console.log("Sum 1 Best : " + Global.best.sum1)
  console.log("Sum 2 Best : " + Global.best.sum2)
  console.log("Best fitness : " + Global.best.fitness)
  console.log("List number : " + Global.listNumber)
  console.log("Genes Best : " + Global.best.genes)
}

const sum = (acc, currentSum) => acc + currentSum
function initListNumber(){
  for(let i=0; i<Global.sizeListNumber; i++){
    Global.listNumber[i] = Math.floor(Math.random()*100)
  }
  Global.sumListNumber = Global.listNumber.reduce(sum)
  console.log(Global.listNumber)
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


DNA = function(similarDNA){
  this.genes = []
  this.fitness = 0
  this.probability = 0
  if(arguments.length == 0){ // Initialisation tout debut
    for(let i=0; i<Global.sizeListNumber; i++){
      Math.random() > 0.5 ? this.genes[i] = 1 : this.genes[i] = 0
    }
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
        Math.random() > 0.5 ? this.genes[i] = 1 : this.genes[i] = 0
      }
    }
  }
}

var fitGrand = 1000000
function calculateFitness() {
  let minFit = 1000000
  for(let i=0; i<Global.populationSize; i++){
    let sum1 = 0
    let sum2 = 0
    for(let j=0; j<Global.listNumber.length; j++){
      Global.population[i].genes[j] === 1 ? sum1 += Global.listNumber[j] : sum2 += Global.listNumber[j]
    }
    Global.population[i].sum1 = sum1
    Global.population[i].sum2 = sum2
    Global.population[i].fitness = fitGrand - Math.abs(sum1-sum2)
    // reduction des ecarts ed fitness avec minFit:
    if(Global.population[i].fitness < minFit) minFit = Global.population[i].fitness
  }
  Global.population.forEach(elem => elem.fitness -= minFit)

  // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
  for(let i=0; i<Global.populationSize; i++){
    Global.population[i].fitness = Math.pow(Global.population[i].fitness, 2)
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
