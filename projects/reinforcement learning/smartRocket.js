"use strict"

var ctx, canvas
var width = 1200, height = 900

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
  program.applyGenesPopulation()
  program.removeOutsideRockets()
  program.updateClock()

  dessin()
  requestAnimationFrame(loop);
}

class Program {
  constructor() {
    this.clock = 0
    this.geneClockRatio = 1

    this.populationSize = 100
    this.listRockets = []
    this.initPopulation()

    this.maxSpeed = 1
    this.maxAcceleration = 0.1
    this.mutationRate = 0.01
  }

  initPopulation() {
    for (let i = 0; i < this.populationSize; i++) {
      this.listRockets.push(new Rocket())
    }
  }

  breedNewPopulation() {
    this.clock = 0
    this.listRockets.forEach( rocket => rocket.calculateFitness() )
    console.log("New generation")

    let minFit = 10000
    this.listRockets.forEach( rocket => {
      if (rocket.fitness < minFit) minFit = rocket.fitness
    })
    // Augmenter l'importance des écarts
    this.listRockets.forEach( rocket => rocket.fitness -= minFit )
    // idem
    this.listRockets.forEach( rocket => rocket.fitness = Math.pow(rocket.fitness, 2) )

    this.calculatePopulationProbability()
    let tmpRockets = []
    for (let i = 0; i < this.populationSize; i++) {
      tmpRockets.push(new Rocket("similarDNA"))
    }
    this.listRockets = tmpRockets
  }

  calculatePopulationProbability() {
    let sum = 0
    this.listRockets.forEach( rocket => sum += rocket.fitness )
    this.listRockets.forEach( rocket => rocket.probability = rocket.fitness / sum )
  }

  movePopulation() {
    this.listRockets.forEach( rocket => rocket.move() )
  }
  acceleratePopulation() {
    this.listRockets.forEach( rocket => rocket.accelerate() )
  }
  applyGenesPopulation() {
    this.listRockets.forEach( rocket => rocket.applyGenes() )
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
    if(this.clock === DNA.sizeGenes * this.geneClockRatio ) {
      this.breedNewPopulation()
    }
  }
}

class Rocket {
  constructor(similarDNA) {
    this.pos = {x: width/2, y: height/2}
    this.speed = {x: 0, y: 0}
    this.acceleration = {x: 0, y: 0}

    this.fitness = 0
    this.probability = 0
    if (arguments.length === 0) {
      this.DNA = new DNA()
    }
    else {
      this.DNA = new DNA("similarDNA")
    }
  }

  calculateFitness() {
    // 10000 - car bonne fitness => petite distance, pour avoir fitness croissante en fonction de la distance decroissante
    this.fitness = 10000 - Math.sqrt( (this.pos.x - 1200)*(this.pos.x - 1200) + (this.pos.y - 450)*(this.pos.y - 450) )
  }

  move() {
    this.pos.x += this.speed.x
    this.pos.y += this.speed.y
  }

  accelerate() {
    this.speed.x += this.acceleration.x
    this.speed.y += this.acceleration.y
    // // Keep between -1 and 1
    // this.speed.x = Math.min(program.maxSpeed, Math.max(this.speed.x, -program.maxSpeed))
    // this.speed.y = Math.min(program.maxSpeed, Math.max(this.speed.y, -program.maxSpeed))
  }

  // add gravity
  applyGenes() {
    let indexGenes = Math.floor(program.clock / program.geneClockRatio)
    this.acceleration.x += this.DNA.genes[indexGenes].x
    this.acceleration.y += this.DNA.genes[indexGenes].y
    // Keep between -1 and 1
    this.acceleration.x = Math.min(program.maxAcceleration, Math.max(this.acceleration.x, -program.maxAcceleration))
    this.acceleration.y = Math.min(program.maxAcceleration, Math.max(this.acceleration.y, -program.maxAcceleration))
  }

  checkOutside() {
    if (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height) return true
    else return false
  }
}

class DNA {
  constructor(similarDNA) {
    this.genes = []
    if (arguments.length === 0) {
      this.initGenes()
    }
    else {
      this.genesFromParent()
    }
  }
  static get sizeGenes() {
    return 200
  }
  initGenes() {
    for (let i = 0; i < DNA.sizeGenes; i++) {
      this.genes[i] = {x: -0.1 + 0.2*Math.random(), y: -0.1 + 0.2* Math.random()}
    }
  }
  genesFromParent() {
    // Selection de 2 parents
    let mother = this.pickParent()
    let father = this.pickParent()
    // CrossOver de ces 2 parents pour  donner un fils
    let randomCross = Math.floor(Math.random()*mother.genes.length)
    for (let m = 0; m < randomCross; m++) {
      this.genes[m] = mother.genes[m]
    }
    for (let n = randomCross; n < mother.genes.length; n++){
      this.genes[n] = father.genes[n]
    }
    // Mutations potentielles du fils
    for(let i=0; i<this.genes.length; i++){
      let rd = Math.random()
      if (rd < program.mutationRate){
        this.genes[i] = {x: -0.1 + 0.2*Math.random(), y: -0.1 + 0.2* Math.random()}
      }
    }
  }

  pickParent() {
    let index = 0
    let rdm = Math.random()
    while (rdm > 0) {
      rdm = rdm - program.listRockets[index].probability
      index++
    }
    index--
    return program.listRockets[index].DNA
  }
}

const dessin = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.strokeRect(0, 0, canvas.width, canvas.height)
  program.listRockets.forEach( rocket => ctx.strokeRect(rocket.pos.x, rocket.pos.y, 5, 10) )
}

window.addEventListener('load', init);
