// "use strict"

var ctx, canvas
var width = 600, height = 500

const init = () => {
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  // width = window.innerWidth
  // height = window.innerHeight
  ctx.canvas.width = width
  ctx.canvas.height = height
	ctx.font = "40px Comic Sans MS"

  program = new Program()
  console.log(program)
  loop()
}
var program
const loop = () => {
  program.movePopulation()
  program.acceleratePopulation()
  program.removeOutsideRockets()
  program.updateClock()

  dessin()
  requestAnimationFrame(loop);
}

class Program {
  constructor() {
    this.clock = 0
    this.geneClockRatio = 1

    this.populationSize = 10
    this.listRockets = []
    this.initPopulation()
  }

  initPopulation() {
    for (let i = 0; i < this.populationSize; i++) {
      this.listRockets.push(new Rocket())
    }
  }

  movePopulation() {
    this.listRockets.forEach( rocket => rocket.move() )
  }
  acceleratePopulation() {
    this.listRockets.forEach( rocket => rocket.accelerate() )
  }

  removeOutsideRockets() {
    this.listRockets.forEach( (rocket, index) => {
      if (rocket.checkOutside() === true) {
        this.listRockets.splice(index, 1)
      }
    })
  }

  updateClock() {
    this.clock++
  }
}

class Rocket {
  constructor() {
    this.pos = {x: 0, y: 0}
    this.speed = {x: Math.random(), y: Math.random()}
    this.acceleration = {x: 0, y: 0}

    this.DNA = new DNA()
  }

  move() {
    this.pos.x += this.speed.x
    this.pos.y += this.speed.y
  }

  accelerate() {
    this.speed.x += this.acceleration.x
    this.speed.y += this.acceleration.y
  }

  // add gravity
  applyGenes() {

  }

  checkOutside() {
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) return true
    else return false
  }
}

class DNA {
  constructor() {
    this.genes = []
    this.sizeGenes = 200
    this.initGenes()
  }

  initGenes() {
    for (let i = 0; i < this.sizeGenes; i++) {
      this.genes[i] = {x: -1 + 2*Math.random(), y: -1 + 2* Math.random()}
    }
  }
}
//
// DNA = function(similarDNA){
//   this.genes = []
//   this.fitness = 0
//   this.probability = 0
//   if(arguments.length == 0){ // Initialisation tout debut
//     this.genes = createGenes()
//   }
//   else if(arguments.length == 1){
//     // Selection de 2 parents
//     let mother = pickParent()
//     let father = pickParent()
//     // CrossOver de ces 2 parents pour  donner un fils
//     let randomCross = Math.floor(Math.random()*mother.genes.length)
//     for(let m=0; m<randomCross; m++){
//       this.genes[m] = mother.genes[m]
//     }
//     for(let n=randomCross; n<mother.genes.length; n++){
//       this.genes[n] = father.genes[n]
//     }
//     // Mutations potentielles du fils
//     for(let i=0; i<this.genes.length; i++){
//       let rd = Math.random()
//       if(rd < Global.mutationRate){
//         this.genes[i] = createPartOfGene()
//       }
//     }
//   }
// }


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





const dessin = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
  program.listRockets.forEach( rocket => ctx.strokeRect(rocket.pos.x, rocket.pos.y, 5, 10) )
}

window.addEventListener('load', init);
