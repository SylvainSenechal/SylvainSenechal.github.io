let scene, camera, height, width, renderer, container
let composer, pass
let canvas, ctx
const SEED = Math.random()

let mouse = {x: 100, y: 200}
let target = {x: mouse.x, y: mouse.y}
const ELLIPSE_TARGET = {x: 220, y: 45}
const CIRCLE_TARGET = 25
let radiusX = CIRCLE_TARGET
let radiusY = CIRCLE_TARGET
let offsetAngle1 = 0
let offsetAngle2 = 0
height = window.innerHeight
width = window.innerWidth
camera = new THREE.PerspectiveCamera()
camera.position.z = 2
camera.updateMatrixWorld()

const projects = document.getElementsByClassName('projectLink')
const boundingBoxes = [...projects].map(project => project.getBoundingClientRect())

const init = () => {
  // createScene()
  createMouseCanvas()
  // resizeScene()

  // window.addEventListener('resize', resizeScene)
  loop()
}

document.onmousemove = mouse => {
  target.x = mouse.x
  target.y = height - mouse.y
}

const loop = () => {
  // render()
  renderMouse()
  // interpolateMouse()
  requestAnimationFrame(loop)
}

const renderMouse = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000'
  // ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(target.x, canvas.height - target.y, 10, 0, 2 * Math.PI)
  ctx.fill()

  mouse.x += (target.x - mouse.x) * 0.08
  mouse.y += (target.y - mouse.y) * 0.08

  offsetAngle1 += 1
  offsetAngle2 += 1
  let inside = false
  let middleX, middleY

  for (let boundingBox of boundingBoxes) {
    let p = {x: mouse.x, y: canvas.height - mouse.y}
    let a = {x: boundingBox.left, y: boundingBox.top}
    let b = {x: boundingBox.right, y: boundingBox.top}
    let c = {x: boundingBox.right, y: boundingBox.bottom}
    let d = {x: boundingBox.left, y: boundingBox.bottom}
    if (p.y > a.y && p.x < b.x && p.y < c.y && p.x > d.x) {
      inside = true
      middleX = (boundingBox.left + boundingBox.right) / 2
      middleY = (boundingBox.top + boundingBox.bottom) / 2
    }
  }

  if (inside) {
    radiusX += (ELLIPSE_TARGET.x - radiusX) * 0.04
    radiusY += (ELLIPSE_TARGET.y - radiusY) * 0.04
  } else {
    radiusX += (CIRCLE_TARGET - radiusX) * 0.08
    radiusY += (CIRCLE_TARGET - radiusY) * 0.08
  }

  // old effect
  // for (let angle = 0; angle < 5; angle++) {
  //   let x = Math.cos((angle * 8 + offsetAngle1) % 360 * Math.PI / 180) * radiusX
  //   let y = Math.sin((angle * 8 + offsetAngle1) % 360 * Math.PI / 180) * radiusY
  //   ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //   x = Math.cos((angle * 8 + offsetAngle1 + 90) % 360 * Math.PI / 180) * radiusX
  //   y = Math.sin((angle * 8 + offsetAngle1 + 90) % 360 * Math.PI / 180) * radiusY
  //   ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //   x = Math.cos((angle * 8 + offsetAngle1 + 180) % 360 * Math.PI / 180) * radiusX
  //   y = Math.sin((angle * 8 + offsetAngle1 + 180) % 360 * Math.PI / 180) * radiusY
  //   ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //   x = Math.cos((angle * 8 + offsetAngle1 + 270) % 360 * Math.PI / 180) * radiusX
  //   y = Math.sin((angle * 8 + offsetAngle1 + 270) % 360 * Math.PI / 180) * radiusY
  //   ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  // }

  for (let angle = 0; angle < 7; angle++) {
    let a1 = (angle * 8 + offsetAngle1) % 360
    let a2 = (angle * 8 + offsetAngle2) % 360
    let x = Math.cos(a1 * Math.PI / 180) * Math.sin(a2 * Math.PI / 180)
    let y = Math.sin(a1 * Math.PI / 180) * Math.sin(a2 * Math.PI / 180)
    let z = Math.cos(a2 * Math.PI / 180)
    let position = new THREE.Vector3(z, x, y)
    let vector = position.project(camera)
    vector.x = vector.x * radiusX
    vector.y = vector.y * radiusY
    ctx.fillRect(mouse.x + vector.x, canvas.height - mouse.y + vector.y, 1, 1)

    x = Math.cos((a1 + 180) * Math.PI / 180) * Math.sin((a2 + 180) * Math.PI / 180)
    y = Math.sin((a1 + 180) * Math.PI / 180) * Math.sin((a2 + 180) * Math.PI / 180)
    z = Math.cos((a2 + 180) * Math.PI / 180)
    position = new THREE.Vector3(z, x, y)

    vector = position.project(camera)
    vector.x = vector.x * radiusX
    vector.y = vector.y * radiusY
    ctx.fillRect(mouse.x + vector.x, canvas.height - mouse.y + vector.y, 1, 1)
  }
}

const createMouseCanvas = () => {
  canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')
  canvas.id = 'mouseCanvas'
  ctx.canvas.width = width
  ctx.canvas.height = height
  document.getElementById('myContainer').appendChild(canvas)
}

const render = () => {
  pass.uniforms.u_time.value += 60/1000
	composer.render()
}

const createScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera()
  camera.position.z = 2
  camera.updateMatrixWorld()
  renderer = new THREE.WebGLRenderer()

  height = window.innerHeight
	width = window.innerWidth
	renderer.setSize(width, height)
  container = document.getElementById('myContainer')
  container.appendChild(renderer.domElement)

	composer = new THREE.EffectComposer(renderer)
	composer.addPass(new THREE.RenderPass(scene, camera))
	pass = new THREE.ShaderPass(THREE.fbmShader)
	pass.uniforms.u_resolution.value.x = renderer.domElement.width
	pass.uniforms.u_resolution.value.y = renderer.domElement.height
  pass.uniforms.seed.value = SEED
	pass.renderToScreen = true
	composer.addPass(pass)

  canvas = document.getElementsByTagName("canvas")[0]
  canvas.setAttribute('id', 'myCanvas')
}

const interpolateMouse = () => {
  pass.uniforms.u_mouse.value.x += (target.x - pass.uniforms.u_mouse.value.x) * 0.02
  pass.uniforms.u_mouse.value.y += (target.y - pass.uniforms.u_mouse.value.y) * 0.02
}

const resizeScene = () => {
	height = window.innerHeight
	width = window.innerWidth
  canvas.width = width
  canvas.height = height
	renderer.setSize(width, height)
  pass.uniforms.u_resolution.value.x = renderer.domElement.width
  pass.uniforms.u_resolution.value.y = renderer.domElement.height
};

[...projects].forEach( element => {
  element.addEventListener('mouseover', mouse => {
    console.log("oui")
    // document.getElementById("myCanvas").setAttribute("class", "blurred")
    Array.from(document.getElementsByClassName("projectLink")).forEach( elem => {
      if(elem != element){
        elem.setAttribute("class", "projectLink blurred")
      }
      else{
        elem.setAttribute("class", "projectLink")
      }
    })
  })
  element.addEventListener('mouseout', mouse => {
    // document.getElementById("myCanvas").setAttribute("class", "notBlurred")
    Array.from(document.getElementsByClassName("projectLink")).forEach( elem => elem.setAttribute("class", "projectLink notBlurred"))
  })
})

window.addEventListener('load', init)