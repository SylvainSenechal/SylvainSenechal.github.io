var ctx, canvas, jeu, snake

Jeu = function(){
  this.width = 500
  this.height = 500
  this.widthCase = 20
  this.heightCase = 20

  this.appleX = 0
  this.appleY = 0

  this.grid = []

  this.tick = 0
  this.score = 0
}

Snake = function(){
  this.positions = []
  this.direction = "droite"
}

Snake.prototype.createSnake = function(){
  let x = Math.floor(Math.random()*(jeu.width/jeu.widthCase))
  let y = Math.floor(Math.random()*(jeu.height/jeu.heightCase))
  this.positions[0] = {x: x, y: y}
}

Jeu.prototype.createGrid = function(){
  for(let i=0; i<this.width/this.widthCase; i++){
    this.grid[i] = []
    for(let j=0; j<this.height/this.heightCase; j++){
      this.grid[i][j] = 0 // 0 == empty
    }
  }

  this.appleX = Math.floor(Math.random()*(jeu.width/jeu.widthCase))
  this.appleY = Math.floor(Math.random()*(jeu.height/jeu.heightCase))
}

const initGame = () =>{
  jeu = new Jeu()
  jeu.createGrid()

  snake = new Snake()
  snake.createSnake()
  console.log(snake)

  console.log(jeu)
  canvas = document.getElementById('mon_canvas')
  ctx = canvas.getContext('2d')
  ctx.canvas.width = jeu.width
  ctx.canvas.height = jeu.height

  loop()
}

const loop = () =>{ // Voir l'ordre des fonctions
  dessin()
  mechanics()
  requestAnimationFrame(loop);
}

const mechanics = () =>{
  jeu.tick++
  if(jeu.tick%10 === 0){
    let nextPosition = null
    if(snake.direction === "haut"){
      nextPosition = {x: snake.positions[0].x, y: snake.positions[0].y-1}
    }
    else if(snake.direction === "bas"){
      nextPosition = {x: snake.positions[0].x, y: snake.positions[0].y+1}
    }
    else if(snake.direction === "droite"){
      nextPosition = {x: snake.positions[0].x+1, y: snake.positions[0].y}
    }
    else if(snake.direction === "gauche"){
      nextPosition = {x: snake.positions[0].x-1, y: snake.positions[0].y}
    }

    if(snake.positions.find(element => (element.x === nextPosition.x && element.y === nextPosition.y)) != undefined){
      console.log('Perdu')
      jeu = new Jeu()
      jeu.createGrid()

      snake = new Snake()
      snake.createSnake()
    }

    if(snake.positions[0].x === jeu.appleX && snake.positions[0].y === jeu.appleY){
      jeu.score++
      console.log(jeu.score)
      jeu.appleX = Math.floor(Math.random()*(jeu.width/jeu.widthCase))
      jeu.appleY = Math.floor(Math.random()*(jeu.height/jeu.heightCase))
    }

    else{
      snake.positions.pop()
    }

    snake.positions.unshift(nextPosition)
  }
}

document.onkeydown = (e) => {
	if(e.keyCode == 38){ snake.direction = "haut" }
	if(e.keyCode == 39){ snake.direction = "droite" }
	if(e.keyCode == 40){ snake.direction 	= "bas" }
	if(e.keyCode == 37){ snake.direction =	"gauche" }
}

const dessin = () =>{
	ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#00ff00"
  for(let i=0; i<snake.positions.length; i++){
    ctx.fillRect(snake.positions[i].x*jeu.widthCase, snake.positions[i].y*jeu.heightCase, jeu.widthCase, jeu.heightCase);
  }

  ctx.strokeStyle = "#888888"
  for(let i=0; i<jeu.width/jeu.widthCase; i++){
    for(let j=0; j<jeu.height/jeu.heightCase; j++){
      ctx.strokeRect(i*jeu.widthCase, j*jeu.heightCase, jeu.widthCase, jeu.heightCase);
      }
  }

  ctx.fillStyle = "#ff0000"
  ctx.fillRect(jeu.appleX*jeu.widthCase, jeu.appleY*jeu.heightCase, jeu.widthCase, jeu.heightCase);

  for(u=0; u<jeu.nbGamesXaxis; u++){
    for(v=0; v<jeu.nbGamesXaxis; v++){
      for(i=0; i<3; i++){
        for(j=0; j<3; j++){
          ctx.strokeRect(jeu.positionX+i*jeu.widthCase + u*jeu.widthCase*4, jeu.positionY+j*jeu.widthCase + v*jeu.widthCase*4, jeu.widthCase, jeu.widthCase);
        }
      }
    }
  }
}
window.addEventListener('load', initGame);
