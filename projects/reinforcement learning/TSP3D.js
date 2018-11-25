window.addEventListener('load', init, false); // voir l'argument false ?
var mouse = new THREE.Vector2();


function resize(){
	height = window.innerHeight;
	width = window.innerWidth;
	camera.aspect = width / height;
	camera.updateProjectionMatrix();
	renderer.setSize(width, height);
}


function init(){
	createScene();
	createLights();

  initPoints()
  initPopulation()

	loop();
}

function loop(){
  calculateFitness()
  printData()
  linesBetweenPoints()
  calculateProbability()
  mateNewPopulation()
  Global.nbGeneration++

	vitesse();
  // mousePicker();

	renderer.render(scene, camera);
  requestAnimationFrame(loop);
}


var scene, fieldOfView, aspectRatio, height, width, nearPlane, farPlane, renderer, container;
function createScene(){
	height = window.innerHeight;
	width = window.innerWidth;

	scene = new THREE.Scene();

	aspectRatio = width / height;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 40000;

	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
  camera.position.set(Global.width/2, Global.height/2, 2*Global.depth)

	renderer = new THREE.WebGLRenderer({ // voir tous les arguments existants
		alpha: true,
		antialias: true,
		shadowMap: THREE.PCFSoftShadowMap
	});

	renderer.setSize(width, height);

	container = document.getElementById('canvas');
	container.appendChild(renderer.domElement);

	window.addEventListener('resize', resize, false);
}

function createLights(){
	let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9); // VOIR .9 ET 0.9 ?
	scene.add(hemisphereLight);
}

const Global = {
  width: 800,
  height: 800,
  depth: 800,

  nbPoints: 50,
  points: [],
  lines: [],

  populationSize: 1000,
  population: [],

  nbGeneration: 1,
  maxFitness: 0,
  mutationRate: 0.006,

  indexBest: 0,
  bestDNA: null,
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
    z1 = array[i].z
    z2 = array[i+1].z
    dst += Math.sqrt( (x2-x1)*(x2-x1) + (y2-y1)*(y2-y1) + (z2-z1)*(z2-z1) )
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

Point = function(){
  this.x = Math.random()*Global.width
  this.y = Math.random()*Global.height
  this.z = Math.random()*Global.depth
  let point = new PointMesh(this.x, this.y, this.z);
  scene.add(point.mesh);

}

function initPoints(){
  for(let i=0; i<Global.nbPoints; i++){
    Global.points[i] = new Point()
  }
}

PointMesh = function(x, y, z){
	var sunGeom = new THREE.IcosahedronGeometry(10, 1);
	var mat = new THREE.MeshPhongMaterial({
		color:0xcc5012,
		shading:THREE.FlatShading,
		side: THREE.DoubleSide,
	});

	this.mesh = new THREE.Mesh(sunGeom, mat);
  this.mesh.position.set(x, y, z)
}



function linesBetweenPoints() {
	var material = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});

	let geometry = new THREE.Geometry();
  let best = Global.bestDNA.genes

  // Remove last lines
  Global.lines.forEach( line => scene.remove(line))
  Global.lines = []
  // Add new lines
  for(let i=0; i<best.length-1; i++){
    geometry.vertices.push(
  		new THREE.Vector3(best[i].x, best[i].y, best[i].z),
  		new THREE.Vector3(best[i+1].x, best[i+1].y, best[i+1].z)
  	);

    let line = new THREE.Line( geometry, material );
    Global.lines.push(line)
  	scene.add(line);
  }
}

document.onclick = function cl(e){
  elem = document.getElementById("canvas");
  elem.requestPointerLock = elem.requestPointerLock    ||
                            elem.mozRequestPointerLock
  elem.requestPointerLock();

}
document.onmousemove = function vue(e){
	mouse.x = ( e.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( e.clientY / window.innerHeight ) * 2 + 1;

	camera.rotation.order = 'YXZ'; // default is 'XYZ'
	camera.rotateX(-e.movementY*0.2*Math.PI/180);
	camera.rotateY(-e.movementX*0.2*Math.PI/180);
	camera.rotation.z = 0;
}

var haut, bas, droite, gauche;
var vitesseX = 0;
var vitesseY = 0;
document.onkeydown = function pression(e){
	if(e.keyCode == 90){ haut 	= 	true; }
	if(e.keyCode == 68){ droite = 	true; }
	if(e.keyCode == 83){ bas 	= 	true; }
	if(e.keyCode == 81){ gauche = 	true; }
}
document.onkeyup = function relache(e){
	if(e.keyCode == 90){ haut 	= 	false; }
	if(e.keyCode == 68){ droite = 	false; }
	if(e.keyCode == 83){ bas 	=	false; }
	if(e.keyCode == 81){ gauche = 	false; }
}

document.onwheel = function roll(e){
	if(e.deltaY<0){ // zoom
		camera.position.y -= 120;
	}
	else{ // dezoom
		camera.position.y += 120;
	}
}

function vitesse(){
	if(haut 	== true && vitesseY > -15)	{ vitesseY-=1.8; }
	if(droite 	== true && vitesseX < +15)	{ vitesseX+=1.8; }
	if(bas 		== true && vitesseY < +15)	{ vitesseY+=1.8; }
	if(gauche 	== true && vitesseX > -15)	{ vitesseX-=1.8; }

	if(-0.5 < vitesseX && vitesseX < 0.5)	{ vitesseX = 0 }
	else {
		if(vitesseX > 0)					{ vitesseX -= 0.5; }
		else if(vitesseX < 0)				{ vitesseX += 0.5; }
	}

	if(-0.5 < vitesseY && vitesseY < 0.5)	{ vitesseY = 0 }
	else {
		if(vitesseY > 0)					{ vitesseY -= 0.5; }
		else if(vitesseY < 0)				{ vitesseY += 0.5; }
	}

	var VectResGetWDir = new THREE.Vector3();
	var composanteX = -(vitesseY * camera.getWorldDirection(VectResGetWDir).x)   + vitesseX * (-camera.getWorldDirection(VectResGetWDir).z)
	var composanteY =   vitesseY * (-camera.getWorldDirection(VectResGetWDir).z) + vitesseX * camera.getWorldDirection(VectResGetWDir).x

	camera.position.x += composanteX; // gauche droite   vitesseX
	camera.position.z += composanteY; // devant derrière vitesseY 	// A noter : ici composante Y actionne l'axe Z
	camera.position.y += -vitesseY*camera.getWorldDirection(VectResGetWDir).y
}
