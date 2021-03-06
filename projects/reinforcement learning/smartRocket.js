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

  rocketTargets = new RocketTarget()
  program = new Program()
  console.log(rocketTargets)
  console.log(program)
  // let a = new Rocket()
  // a.targets[4].touchedOrder = 2
  // console.log(a)
  // console.log(a.checkWrongTargetOrder())
  loop()
}
var program, rocketTargets
const loop = () => {
  program.movePopulation()
  program.acceleratePopulation()
  program.applyGenesPopulation()
  program.removeOutsideRockets()
  program.checkTouchedTargetPopulation()

  program.updateClock()

  dessin()
  requestAnimationFrame(loop);
}

class RocketTarget {
  constructor() {
    this.nbTargets = 5
    this.targets = []
    this.initRocketTargets()
  }

  initRocketTargets() {
    for (let i = 0; i < this.nbTargets; i++){
      this.targets.push( {x: Math.floor( Math.random()*width ),y: Math.floor( Math.random()*height )})
    }
  }
}

class Program {
  constructor() {
    this.clock = 0
    this.geneClockRatio = 1

    this.populationSize = 1000
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
  checkTouchedTargetPopulation() {
    this.listRockets.forEach( rocket => rocket.checkTouchedTarget() )
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
    this.targets = []
    this.initTargets()
    this.nbTouched = 1

    this.fitness = 0
    this.probability = 0
    if (arguments.length === 0) {
      this.DNA = new DNA()
    }
    else {
      this.DNA = new DNA("similarDNA")
    }
  }
  initTargets() {
    for (let i = 0; i < rocketTargets.nbTargets; i++) {
      this.targets[i] = {touchedOrder: 0, x: rocketTargets.targets[i].x, y: rocketTargets.targets[i].y}
    }
  }
  checkTouchedTarget() {
    this.targets.forEach( (target, index) => {
      if ( dst(target.x, target.y, this.pos.x, this.pos.y) < 20 ) {
        if (this.targets[index].touchedOrder === 0) { // Necessaire car le rocket touche plusieurs fois la cible avant de s en eloigner
          this.targets[index].touchedOrder = this.nbTouched
          this.nbTouched++
          console.log('touche')
          // console.log(this.targets)
        }
      }
    })
  }
  calculateFitness() {
    // 10000 - car bonne fitness => petite distance, pour avoir fitness croissante en fonction de la distance decroissante
    // this.fitness = 10000 - Math.sqrt( (this.pos.x - 1200)*(this.pos.x - 1200) + (this.pos.y - 900)*(this.pos.y - 900) )
    this.fitness = 10000
    if (this.checkWrongTargetOrder()) {
      this.fitness = 0
      console.log('pasbon')
    }
    else {
      let indexNextTarget = 0
      this.targets.forEach( (target, index) => {
        if (target.touchedOrder === index + 1) {
          this.fitness += 1500
          indexNextTarget = index + 1 // Voir pour la derniere target bug possible out of array
          console.log('oui')
        }
      })
      this.fitness -= Math.sqrt(
         (this.pos.x - rocketTargets.targets[indexNextTarget].x) * (this.pos.x - rocketTargets.targets[indexNextTarget].x) +
         (this.pos.y - rocketTargets.targets[indexNextTarget].y) * (this.pos.y - rocketTargets.targets[indexNextTarget].x)
       )
    }
  }
  checkWrongTargetOrder() {
    let wrong = false
    this.targets.forEach( (target, index) => {
      if (target.touchedOrder != 0 && target.touchedOrder != index + 1) {
        wrong = true
      }
    })
    return wrong
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

  ctx.fillStyle = "#ff0000"
  rocketTargets.targets.forEach( target => {
    ctx.beginPath();
    ctx.arc(target.x, target.y, 5, 0, 2 * Math.PI);
    ctx.fill();
  })
  ctx.beginPath();
  ctx.moveTo(width/2, height/2)
  rocketTargets.targets.forEach( target => {
    ctx.lineTo(target.x, target.y);
  })
  ctx.stroke()
}

const dst = (x1, y1, x2, y2) => Math.sqrt( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) )

window.addEventListener('load', init);
