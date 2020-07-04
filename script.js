'use strict'

// TODO:  hover foncer avec blur des autres ? mettre les mousemove listener dans le init
// TODO: voir la seed

/////////////////////////
// FBM SHADER ///////////
/////////////////////////

let scene, camera, height, width, renderer, container
let composer, pass
let targetX = 0
let targetY = 0
let canvas, ctx
const SEED = Math.random()

const init = () => {
  createScene()
  createMouseCanvas()
  resizeScene()
  loop()
}

const loop = () => {
  render()
  renderMouse()
  interpolateMouse()
  // console.log({targetX, targetY})
  requestAnimationFrame(loop)
}

let mouse = {x: 0, y: 0}
const ELLIPSE_TARGET = {x: 220, y: 45}
const CIRCLE_TARGET = 25
let radiusX = CIRCLE_TARGET
let radiusY = CIRCLE_TARGET
let cpt = 0
const renderMouse = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(targetX, canvas.height - targetY, 10, 0, 2 * Math.PI)
  ctx.fill()

  mouse.x += (targetX-mouse.x) * 0.08
  mouse.y += (targetY-mouse.y) * 0.08

  cpt+=1
  let project = document.getElementsByClassName('projectLink')//[10].getBoundingClientRect()
  let inside = false
  let middleX, middleY

  for (let elem of project) {
    let boundingBox = elem.getBoundingClientRect()

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

  for (let angle = 0; angle < 5; angle++) {
    let x = Math.cos((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusX
    let y = Math.sin((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusY
    ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
    x = Math.cos((angle * 8 + cpt + 90) % 360 * Math.PI / 180) * radiusX
    y = Math.sin((angle * 8 + cpt + 90) % 360 * Math.PI / 180) * radiusY
    ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
    x = Math.cos((angle * 8 + cpt + 180) % 360 * Math.PI / 180) * radiusX
    y = Math.sin((angle * 8 + cpt + 180) % 360 * Math.PI / 180) * radiusY
    ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
    x = Math.cos((angle * 8 + cpt + 270) % 360 * Math.PI / 180) * radiusX
    y = Math.sin((angle * 8 + cpt + 270) % 360 * Math.PI / 180) * radiusY
    ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  }

  // if (inside) {
  //   for (let angle = 0; angle < 5; angle++) {
  //     let x = Math.cos((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusX
  //     let y = Math.sin((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(middleX + x, middleY + y, 1, 1)
  //     x = Math.cos((angle * 8 + cpt + 90) % 360 * Math.PI / 180) * radiusX
  //     y = Math.sin((angle * 8 + cpt + 90) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(middleX + x, middleY + y, 1, 1)
  //     x = Math.cos((angle * 8 + cpt + 180) % 360 * Math.PI / 180) * radiusX
  //     y = Math.sin((angle * 8 + cpt + 180) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(middleX + x, middleY + y, 1, 1)
  //     x = Math.cos((angle * 8 + cpt + 270) % 360 * Math.PI / 180) * radiusX
  //     y = Math.sin((angle * 8 + cpt + 270) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(middleX + x, middleY + y, 1, 1)
  //   }
  // } else {
  //   for (let angle = 0; angle < 5; angle++) {
  //     let x = Math.cos((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusX
  //     let y = Math.sin((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //     x = Math.cos((angle * 8 + cpt + 90) % 360 * Math.PI / 180) * radiusX
  //     y = Math.sin((angle * 8 + cpt + 90) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //     x = Math.cos((angle * 8 + cpt + 180) % 360 * Math.PI / 180) * radiusX
  //     y = Math.sin((angle * 8 + cpt + 180) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //     x = Math.cos((angle * 8 + cpt + 270) % 360 * Math.PI / 180) * radiusX
  //     y = Math.sin((angle * 8 + cpt + 270) % 360 * Math.PI / 180) * radiusY
  //     ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  //   }
  // }

  // for (let angle = 25; angle < 45; angle++) {
  //   let x = Math.cos((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusX
  //   let y = Math.sin((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusY
  //   ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  // }
  // for (let angle = 0; angle < 45; angle++) {
  //   let occlusion = false
  //   let x = Math.cos((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusX
  //   let y = Math.sin((angle * 8 + cpt) % 360 * Math.PI / 180) * radiusY
  //   for (let elem of project) {
  //     let boundingBox = elem.getBoundingClientRect()
  //     let p = {x: x + mouse.x, y: y + canvas.height - mouse.y}
  //     let a = {x: boundingBox.left, y: boundingBox.top}
  //     let b = {x: boundingBox.right, y: boundingBox.top}
  //     let c = {x: boundingBox.right, y: boundingBox.bottom}
  //     let d = {x: boundingBox.left, y: boundingBox.bottom}
  //     // let ap = {x: p.x - a.x, y: p.y - a.y}
  //     // let ab = {x: b.x - a.x, y: b.y - a.y}
  //     // let ad = {x: d.x - a.x, y: d.y - a.y}
  //     // let c1 = (dot(ap, ab) > 0 && dot(ab, ab) > dot(ap, ab)) ? true : false
  //     // let c2 = (dot(ap, ad) > 0 && dot(ad, ad) > dot(ap, ad)) ? true : false
  //     // if (c1 && c2) ctx.fillRect(targetX + x, canvas.height - targetY + y, 1, 1)
  //     if (p.y > a.y && p.x < b.x && p.y < c.y && p.x > d.x) occlusion = true
  //   }
  //   if (!occlusion) ctx.fillRect(mouse.x + x, canvas.height - mouse.y + y, 1, 1)
  // }
}

const dot = (u, v) => u.x * v.x + u.y + v.y

const createMouseCanvas = () => {
  canvas = document.createElement('canvas')
  ctx = canvas.getContext('2d')
  canvas.id = 'mouseCanvas'
  ctx.canvas.width = width
  ctx.canvas.height = height
  document.getElementById('myContainer').appendChild(canvas)
  console.log(canvas)

}

const render = () => {
  pass.uniforms.u_time.value += 60/1000
	composer.render()
}

const createScene = () => {
  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera()
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

  canvas = document.getElementsByTagName("canvas")[0]//.setAttribute("id", "myCanvas")
  canvas.setAttribute('id', 'myCanvas')
}

document.onmousemove = mouse => {
  targetX = mouse.x
  targetY = height - mouse.y
}
const interpolateMouse = () => {
  pass.uniforms.u_mouse.value.x += (targetX-pass.uniforms.u_mouse.value.x) * 0.02
  pass.uniforms.u_mouse.value.y += (targetY-pass.uniforms.u_mouse.value.y) * 0.02
}

const resizeScene = () => {
	height = window.innerHeight
	width = window.innerWidth
  canvas.width = width
  canvas.height = height
	renderer.setSize(width, height)
  pass.uniforms.u_resolution.value.x = renderer.domElement.width
  pass.uniforms.u_resolution.value.y = renderer.domElement.height
}

/////////////////////////
// CSS HANDLING /////////
/////////////////////////

let projects = document.getElementsByClassName('projectLink')

Array.from(projects).forEach( element => {
  element.addEventListener('mouseover', mouse => {
    document.getElementById("myCanvas").setAttribute("class", "blurred")
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
    document.getElementById("myCanvas").setAttribute("class", "notBlurred")
    Array.from(document.getElementsByClassName("projectLink")).forEach( elem => elem.setAttribute("class", "projectLink notBlurred"))
  })
})

window.addEventListener('load', init)
window.addEventListener('resize', resizeScene)
