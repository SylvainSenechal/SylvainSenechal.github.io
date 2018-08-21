var mouseDown = false
document.onmousedown = function(e){
  mouseDown = true
}
document.onmouseup = function(e){
  mouseDown = false
}
document.onmousemove = function(e){
  if(mouseDown === true){
    let caseX = Math.floor(e.x/Terrain.widthCase)
    let caseY = Math.floor(e.y/Terrain.heightCase)
    try{
      Terrain.grid[caseX][caseY].value = 1
    }
    catch(error){
      //console.error(error)
    }
  }
}

var slider = document.getElementById("slider");
slider.oninput = function() {
  Terrain.speed = this.value
  document.getElementById("slideVal").innerHTML = "Speed(1-10) : " + this.value
}

const start = () => Terrain.start = true
const clearMap = () => {
  Terrain.grid.forEach( line => {
    line.forEach( cell => cell.value = 0 )
  })
}

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

  initTerrain()
  loop()
}

function loop(){ // Voir l'ordre des fonctions
  dessin()
  if(Terrain.start === true){
    for(let i=0; i<Terrain.speed; i++){
      if(Terrain.done === false){
        search()
      }
    }
  }
  requestAnimationFrame(loop);
}

var Terrain = {
  grid: [], // 0 : pas d'obstacle, 1 : obstacle
  sizeX: 100,
  sizeY: 100,
  percentObstacle: 0.5,
  widthCase: 8,
  heightCase: 8,

  closedList: [],
  openList: [],
  currentNode: undefined,
  bestPath: [],
  done: false,
  start: false,
  speed: 1,
}

const search = () => {
  // Meilleur noeud openList :
  if(Terrain.openList.length === 0){
    console.log('openList is empty')
  }
  else{
    let bestNode = Terrain.openList[0]
    let indiceBest = 0
    for(let i=0; i<Terrain.openList.length; i++){
      if(Terrain.openList[i].f < bestNode.f){
        bestNode = Terrain.openList[i]
        indiceBest = i
      }
    }
    //console.log('Best length : ' + bestNode.f)
    if(bestNode.x === Terrain.sizeX-1 && bestNode.y === Terrain.sizeY-1){
      Terrain.done = true
    }

    Terrain.openList.splice(indiceBest, 1)
    Terrain.closedList.push(bestNode)
    Terrain.currentNode = bestNode
  }

  let listNeighb = []
  if(Terrain.currentNode.x > 0){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x-1][Terrain.currentNode.y])
    Terrain.grid[Terrain.currentNode.x-1][Terrain.currentNode.y].visited = true
  }
  if(Terrain.currentNode.x < Terrain.sizeX-1){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x+1][Terrain.currentNode.y])
    Terrain.grid[Terrain.currentNode.x+1][Terrain.currentNode.y].visited = true
  }
  if(Terrain.currentNode.y > 0){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x][Terrain.currentNode.y-1])
    Terrain.grid[Terrain.currentNode.x][Terrain.currentNode.y-1].visited = true
  }
  if(Terrain.currentNode.y < Terrain.sizeY-1){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x][Terrain.currentNode.y+1])
    Terrain.grid[Terrain.currentNode.x][Terrain.currentNode.y+1].visited = true
  }

  if(Terrain.currentNode.y > 0 && Terrain.currentNode.x > 0){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x-1][Terrain.currentNode.y-1])
    Terrain.grid[Terrain.currentNode.x-1][Terrain.currentNode.y-1].visited = true
  }
  if(Terrain.currentNode.y < Terrain.sizeY-1 && Terrain.currentNode.x < Terrain.sizeX-1){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x+1][Terrain.currentNode.y+1])
    Terrain.grid[Terrain.currentNode.x+1][Terrain.currentNode.y+1].visited = true
  }
  if(Terrain.currentNode.x > 0 && Terrain.currentNode.y < Terrain.sizeY-1){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x-1][Terrain.currentNode.y+1])
    Terrain.grid[Terrain.currentNode.x-1][Terrain.currentNode.y+1].visited = true
  }
  if(Terrain.currentNode.x < Terrain.sizeX-1 && Terrain.currentNode.y > 0){
    listNeighb.push(Terrain.grid[Terrain.currentNode.x+1][Terrain.currentNode.y-1])
    Terrain.grid[Terrain.currentNode.x+1][Terrain.currentNode.y-1].visited = true
  }

  listNeighb.forEach(neighbour => {

    // Noeud obstacle on s'en fou
    if(neighbour.value === 1) {}
    // Noeud pas dans liste fermee
    else if(Terrain.closedList.find(elem1 => elem1.x === neighbour.x && elem1.y === neighbour.y) === undefined){
      // Calcul de F de ce noeud
      neighbour.parent = Terrain.currentNode
      neighbour.g = Terrain.currentNode.g + dst(neighbour.x, neighbour.y, Terrain.currentNode.x, Terrain.currentNode.y)
      neighbour.h = dst(neighbour.x, neighbour.y, Terrain.sizeX, Terrain.sizeY)
      neighbour.f = neighbour.g + neighbour.h
      // Noeud dans la liste ouverte, mise a jour de la valeur F
      let previousNode = Terrain.openList.find(elem1 => elem1.x === neighbour.x && elem1.y === neighbour.y)
      if(previousNode != undefined){
        // Si nouveau noeud meilleur, mise a jour
        if(previousNode.f > neighbour.f){
          // A reverifier ..
          previousNode.f = neighbour.f
          previousNode.h = neighbour.h
          previousNode.g = neighbour.g
        }
      }
      else{
        Terrain.openList.push(new Node(neighbour.x, neighbour.y, neighbour.value, neighbour.parent, neighbour.g, neighbour.h, neighbour.f))
      }
    }
  })

  createBestPath()
}

const createBestPath = () =>{
  let endNode = Terrain.currentNode
  let path = []
  while(endNode.parent != undefined){
    path.push(endNode)
    endNode = endNode.parent
  }
  Terrain.bestPath = path
}


const dst = (x1, y1, x2, y2) =>{
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2)) //Math.abs(x1-x2) + Math.abs(y1-y2)
}

const initTerrain = () => {
  for(let i=0; i<Terrain.sizeX; i++){
    Terrain.grid[i] = []
    for(let j=0; j<Terrain.sizeY; j++){
      if(Math.random() > Terrain.percentObstacle) Terrain.grid[i][j] = new Node(i, j, 0)
      else Terrain.grid[i][j] = new Node(i, j, 1)
    }
  }
  Terrain.grid[0][0].value = 0
  Terrain.grid[Terrain.sizeX-1][Terrain.sizeY-1].value = 0
  Terrain.grid[0][0].f = dst(0, 0, Terrain.sizeX, Terrain.sizeY)
  Terrain.currentNode = Terrain.grid[0][0]
  Terrain.openList.push(Terrain.currentNode)
}
Node = function(x, y, value, parent, g, h, f){
  this.x = x
  this.y = y
  this.value = value
  this.parent = parent
  this.visited = false

  this.g = g || 0
  this.h = h || 0
  this.f = f || 0
}

function dessin(){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#AAAAAA"
  ctx.fillRect(0, 0, Terrain.widthCase*Terrain.sizeX, Terrain.heightCase*Terrain.sizeY);

  for(let i=0; i<Terrain.sizeX; i++){
    for(let j=0; j<Terrain.sizeY; j++){

      if(Terrain.grid[i][j].value === 0){
        if(Terrain.grid[i][j].visited === true){
          ctx.fillStyle = "#0000FF"
          ctx.fillRect(i*Terrain.widthCase, j*Terrain.heightCase, Terrain.widthCase, Terrain.heightCase);
        }
      }
      ctx.fillStyle = "#000000"
      if(Terrain.grid[i][j].value === 1){
        //ctx.fillRect(i*Terrain.widthCase, j*Terrain.heightCase, Terrain.widthCase, Terrain.heightCase);
        ctx.beginPath()
        ctx.arc(i*Terrain.widthCase + Terrain.widthCase/2, j*Terrain.heightCase + Terrain.heightCase/2, Terrain.widthCase/2, 0, 2*Math.PI)
        ctx.fill()
      }
    }
  }

  ctx.fillStyle = "#00FF00"
  for(let i=0; i<Terrain.bestPath.length; i++){
    //ctx.fillRect(Terrain.bestPath[i].x*Terrain.widthCase, Terrain.bestPath[i].y*Terrain.heightCase, Terrain.widthCase, Terrain.heightCase);
    ctx.beginPath()
    ctx.arc(Terrain.bestPath[i].x*Terrain.widthCase + Terrain.widthCase/2, Terrain.bestPath[i].y*Terrain.heightCase + Terrain.heightCase/2, Terrain.widthCase/2, 0, 2*Math.PI)
    ctx.fill()
  }

  // ctx.beginPath()
  // ctx.fillStyle = jeu.listCar[i].color
  // ctx.arc(jeu.listCar[i].x, jeu.listCar[i].y, jeu.listCar[i].size, 0, 2*Math.PI)
  // ctx.fill()



}
