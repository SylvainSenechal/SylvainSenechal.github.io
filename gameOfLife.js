window.addEventListener('load', init);
var ctx, canvas
var width, height

// Utiliser des couleurs similaire (moyenne des 3 pour engendrer un nouvel individu quand il faut, nécessite case = +/- objet)
// barre html pour ajuster fps

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
  infect()

  dessin()
  requestAnimationFrame(loop);
}

function initGame(){
  for(i=0; i<jeu.nbCaseX; i++){
    jeu.map[i] = []
    for(j=0; j<jeu.nbCaseY; j++){
      jeu.map[i][j] = 0 // sol
    }
  }
}

var jeu = {
  map: [], // 0: empty, 1: infested
  positionX: 50,
  positionY: 50,
  widthCase: 18, // pair
  nbCaseX: 100, // largeur
  nbCaseY: 50,  // heuteur

  nbInfested: 0,
  nbGeneration: 0,

  on: false,
}

function infect(){ // Voir optimisation ?
  if(jeu.on){
    let result = []
    let countInfect = 0
    for(i=0; i<jeu.nbCaseX; i++){
      result[i] = []
      for(j=0; j<jeu.nbCaseY; j++){
        result[i][j] = jeu.map[i][j]
      }
    }
    for(i=0; i<jeu.nbCaseX; i++){
      for(j=0; j<jeu.nbCaseY; j++){
        if(jeu.map[i][j] == 1){ // Surviving one
          if(countNeighbors(i, j) == 2 || countNeighbors(i, j) == 3){
            result[i][j] = 1
            countInfect++
          }
          else{
            result[i][j] = 0
          }
        }
        else if(jeu.map[i][j] == 0){ // New one
          if(countNeighbors(i, j) == 3){
            result[i][j] = 1
            countInfect++
          }
        }
      }
    }
    jeu.nbGeneration++
    jeu.nbInfested = countInfect
    jeu.map = result
  }
}


function countNeighbors(i, j){
  let cpt = 0
  for(x=i-1; x<i+2; x++){
    for(y=j-1; y<j+2; y++){

      if(x >= 0 && x < jeu.nbCaseX && y >= 0 && y < jeu.nbCaseY){
        if(x != i || y != j){
          if(jeu.map[x][y] == 1){
            cpt++
          }
        }
      }
    }
  }
  return cpt
}

function start(){
  jeu.on = !jeu.on

  if(jeu.on){
    document.getElementById("on").innerHTML = "Pause"
  }
  else{
    document.getElementById("on").innerHTML = "Start"
  }
}

function clean(){
  for(i=0; i<jeu.nbCaseX; i++){
    for(j=0; j<jeu.nbCaseY; j++){
      jeu.map[i][j] = 0 // sol
    }
  }
  jeu.nbGeneration = 0
}

/////////////////////////////
// CREATION DE MAP + DESSINER
/////////////////////////////

document.onmousemove = function(e){
  if(mouseDown == true){
    let caseX = Math.floor((e.x-jeu.positionX)/jeu.widthCase)
    let caseY = Math.floor((e.y-jeu.positionY)/jeu.widthCase)

    jeu.map[caseX][caseY] = 1
  }
  else if(mouseDown == false){
    let caseX = Math.floor((e.x-jeu.positionX)/jeu.widthCase)
    let caseY = Math.floor((e.y-jeu.positionY)/jeu.widthCase)
    if(caseX >= 0 && caseX < jeu.nbCaseX && caseY >= 0 && caseY < jeu.nbCaseY){
      ctx.fillStyle = "rgba(0, 0, 0, 1)"
      ctx.fillRect(jeu.positionX + caseX*jeu.widthCase, jeu.positionY + caseY*jeu.widthCase, jeu.widthCase, jeu.widthCase);
    }
  }
}

document.onclick = function(e){
  let caseX = Math.floor((e.x-jeu.positionX)/jeu.widthCase)
  let caseY = Math.floor((e.y-jeu.positionY)/jeu.widthCase)
  if(caseX >= 0 && caseX < jeu.nbCaseX && caseY >= 0 && caseY < jeu.nbCaseY){
    if(jeu.map[caseX][caseY] == 0){
      jeu.map[caseX][caseY] = 1
    }
    else{
      jeu.map[caseX][caseY] = 0
    }
  }
}

var mouseDown = false
document.onmousedown = function(e){
  mouseDown = true
}
document.onmouseup = function(e){
  mouseDown = false
}





function dessin(){ // Dessiner les 5 inputs des voitures
	ctx.clearRect(0, 0, canvas.width, jeu.positionY) // clear map
  ctx.strokeStyle = "#000000"
  ctx.strokeRect(jeu.positionX, jeu.positionY, jeu.widthCase*jeu.nbCaseX, jeu.widthCase*jeu.nbCaseY); // Borders

  ctx.globalCompositeOperation = "source-over";
  for(i=0; i<jeu.nbCaseX; i++){
    for(j=0; j<jeu.nbCaseY; j++){
      ctx.strokeStyle = "rgba(152, 175, 211, 1)" // "#4c6182"
      ctx.strokeRect(jeu.positionX + i*jeu.widthCase, jeu.positionY + j*jeu.widthCase, jeu.widthCase, jeu.widthCase);

      if(jeu.map[i][j] == 0){ // chemin
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)" // "#000000"
        ctx.fillRect(jeu.positionX + i*jeu.widthCase, jeu.positionY + j*jeu.widthCase, jeu.widthCase, jeu.widthCase);
      }
      else if(jeu.map[i][j] == 1){ // chemin
        ctx.fillStyle = "rgba(0, 0, 0, 1)" // "#000000"
        ctx.fillRect(jeu.positionX + i*jeu.widthCase, jeu.positionY + j*jeu.widthCase, jeu.widthCase, jeu.widthCase);
      }
    }
  }


  ctx.globalCompositeOperation = "darken";

  ctx.strokeStyle = "#000000"
	ctx.strokeText("Infested : " + jeu.nbInfested + " / " + (jeu.nbCaseX*jeu.nbCaseY) + " |||", 10, 40)
  ctx.strokeText("Generation : " + jeu.nbGeneration, 500, 40)
}

// function getRandomColor() {
//   var letters = '0123456789ABCDEF';
//   var color = '#';
//   for (var i = 0; i < 6; i++) {
//     color += letters[Math.floor(Math.random() * 16)];
//   }
//   return color;
// }
