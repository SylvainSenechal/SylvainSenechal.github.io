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
	ctx.font = "20px Comic Sans MS"

  initPoints()
  initPopulation()
  loop()
}

function loop(){ // Voir l'ordre des fonctions
  //dessin()
  for(let speed = 0; speed<1; speed++){
    calculateFitness()
    printData()
    dessin()
    calculateProbability()
    mateNewPopulation()

    Global.nbGeneration++
  }
  requestAnimationFrame(loop);
}


var Global = {
  width: 800,
  height: 400,
  nbPoints: 70,
  points: [],
  populationSize: 2500,
  population: [],
  nbGeneration: 1,
  maxFitness: 0,
  mutationRate: 0.006,

  indexBest: 0,
  bestDNA: null
}

//////////////////////
// NE PAS MELANGER 2 ADN SINON POINTS DOUBLES DE TEMPS EN TEMPS
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
    let randomCross = Math.floor(Math.random()*mother.genes.length) // Depart
    let randomCross2 = Math.floor(Math.random()*(mother.genes.length-randomCross)) // Nombre de genes pris sur la mere apres le depart
    let tmp = []
    for(let i=randomCross; i<randomCross+randomCross2; i++){
      tmp.push(mother.genes[i])
    }

    // On remplit le debut du tableau avec les genes du pere
    let j=0
    let id=0
    while(id<randomCross){
      if(tmp.find( elem => (father.genes[j] == elem)) === undefined){
        this.genes.push(father.genes[j])
        id++
      }
      j++
    }
    // puis les genes de la mere selectionnes avec randomCross2
    for(let i=0; i<tmp.length; i++){
      this.genes.push(tmp[i]) // ajouter direct larray concatene
    }
    // puis on complète avec le reste du pere
    j=0
    while(this.genes.length<mother.genes.length){
      if(this.genes.find( elem => (father.genes[j] == elem)) === undefined){
        this.genes.push(father.genes[j])
      }
      j++
    }

    // Mutations potentielles du fils
    for(let i=0; i<this.genes.length; i++){
      let rd = Math.random()
      if(rd < Global.mutationRate){
        this.mutate()
      }
    }
  }
}

DNA.prototype.mutate = function(){
  let rd1 = Math.floor(Math.random()*this.genes.length)
  let rd2 = Math.floor(Math.random()*this.genes.length)
  let tmp1 = this.genes[rd1]
  let tmp2 = this.genes[rd2]
  this.genes[rd1] = tmp2
  this.genes[rd2] = tmp1
}

Point = function(){
  this.x = Math.random()*Global.width
  this.y = Math.random()*Global.height
}

function initPoints(){
  for(let i=0; i<Global.nbPoints; i++){
    Global.points[i] = new Point()
  }
}

function initPopulation(){
  for(let i=0; i<Global.populationSize; i++){
    Global.population[i] = new DNA()
  }

  Global.bestDNA = new DNA()
  Global.bestDNA.fitness = 0
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

  let listPoints = []
  let random

  for(let i=0; i<Global.nbPoints; i++) listPoints.push(Global.points[i])
  while(listPoints.length > 0){
    random = Math.floor(Math.random()*listPoints.length)
    genes.push(listPoints[random])
    listPoints.splice(random, 1)
  }
  return genes
}


function calculateFitness() {
  let minFit = 10000
  for(let i=0; i<Global.populationSize; i++){ // Pour chaque individu, on calcule le trajet
    Global.population[i].fitness = 1 / totalDistance(Global.population[i].genes)
    //console.log(1 / totalDistance(Global.population[i].genes))
    // reduction des ecarts de fitness avec minFit:
    if(Global.population[i].fitness < minFit) minFit = Global.population[i].fitness
  }
  // console.log('min' + minFit)
  // for(let i=0; i<Global.populationSize; i++){
  //   console.log(Global.population[i].fitness)
  // }

  Global.population.forEach(elem => elem.fitness -= minFit)

  //
  // // On commence par mettre a la puissance 4 les fitness pour garder vraiment les meilleures
  for(let i=0; i<Global.populationSize; i++){
    Global.population[i].fitness = Math.pow(Global.population[i].fitness, 2)
    //jeu.listFitness[a] = Math.pow(1.05, jeu.listFitness[a])
  }
}

function totalDistance(array){
  let x1 = 0
  let x2 = 0
  let y1 = 0
  let y2 = 0
  let dst = 0
  for(let i=0; i<array.length-1; i++){
    x1 = array[i].x
    x2 = array[i+1].x
    y1 = array[i].y
    y2 = array[i+1].y
    dst += Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) )
  }
  return dst
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


function printData(){
  let maxFit = 0
  let indexMax = 0
  for(let i=0; i<Global.populationSize; i++){
    if(Global.population[i].fitness > maxFit){
      maxFit = Global.population[i].fitness
      indexMax = i
    }
  }
  Global.indexBest = indexMax
  if(totalDistance(Global.population[indexMax].genes) < totalDistance(Global.bestDNA.genes)){
    Global.bestDNA = Global.population[indexMax]
  }
  console.log(totalDistance(Global.population[indexMax].genes))
}


function dessin(){
	ctx.clearRect(0, 0, Global.width + 50, 2*(Global.height + 50))
  ctx.fillStyle = "#000000"

  for(let i=0; i<Global.nbPoints; i++){
    ctx.beginPath()
    ctx.arc(Global.points[i].x + 50, Global.points[i].y + 50, 5, 0, 2*Math.PI)
    ctx.fill()
  }
  let best = Global.population[Global.indexBest].genes
  ctx.beginPath()
  ctx.moveTo(best[0].x + 50, best[0].y + 50)
  for(let i=1; i<best.length; i++){
    ctx.lineTo(best[i].x + 50, best[i].y + 50)
  }
  ctx.stroke()

  // Dessin du meilleur toute generation confondues :
  for(let i=0; i<Global.nbPoints; i++){
    ctx.beginPath()
    ctx.arc(Global.points[i].x + 50, Global.height + Global.points[i].y + 100, 5, 0, 2*Math.PI)
    ctx.fill()
  }
  let bestEver = Global.bestDNA.genes
  ctx.beginPath()
  ctx.moveTo(bestEver[0].x + 50, Global.height + bestEver[0].y + 100)
  for(let i=1; i<bestEver.length; i++){
    ctx.lineTo(bestEver[i].x + 50, Global.height + bestEver[i].y + 100)
  }
  ctx.stroke()


  // ctx.strokeStyle = "#000000"
  ctx.strokeText("Best DNA ever      : " + Math.floor(totalDistance(Global.bestDNA.genes)), 10, 20)
  ctx.strokeText("Best current DNA : " + Math.floor(totalDistance(Global.population[Global.indexBest].genes)), 10, 40)
}
