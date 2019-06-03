'use strict';

// TODO:  hover foncer avec blur des autres ? mettre les mousemove listener dans le init
// TODO: voir la seed

/////////////////////////
// FBM SHADER ///////////
/////////////////////////

var scene, camera, height, width, renderer, container
var composer, pass
var targetX = 0
var targetY = 0
const SEED = Math.random()

const init = function(){
  createScene()
  resizeScene()
  loop()
}

const loop = function(){
  render()
  interpolateMouse()
  requestAnimationFrame(loop)
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
	composer.addPass(new THREE.RenderPass(scene, camera));
	pass = new THREE.ShaderPass( THREE.fbmShader );
	pass.uniforms.u_resolution.value.x = renderer.domElement.width
	pass.uniforms.u_resolution.value.y = renderer.domElement.height
  pass.uniforms.seed.value = SEED
	pass.renderToScreen = true
	composer.addPass(pass)

  document.getElementsByTagName("canvas")[0].setAttribute("id", "myCanvas")
}

document.onmousemove = mouse => {
  targetX = mouse.x
  targetY = height - mouse.y
  let normalized = (15-2) * (mouse.x / width) + 2
  pass.uniforms.u_octave.value = Math.floor(normalized)
}
const interpolateMouse = () => {
  pass.uniforms.u_mouse.value.x += (targetX-pass.uniforms.u_mouse.value.x) * 0.02
  pass.uniforms.u_mouse.value.y += (targetY-pass.uniforms.u_mouse.value.y) * 0.02
}

const resizeScene = () => {
	height = window.innerHeight
	width = window.innerWidth
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
  });
})

window.addEventListener('load', init)
window.addEventListener('resize', resizeScene)
