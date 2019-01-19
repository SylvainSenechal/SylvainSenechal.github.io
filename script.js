'use strict';
// browser-sync start --server -f -w

import vertParticles from './mod/fbm.vert'
import {dst} from './mod/distance.js'
console.log(dst(5,3))

let pj = document.getElementsByClassName('projectLink')

Array.from(pj).forEach(function(element){
  element.addEventListener('mouseover', function(e){
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
  element.addEventListener('mouseout', function(e){
    document.getElementById("myCanvas").setAttribute("class", "notBlurred")
    Array.from(document.getElementsByClassName("projectLink")).forEach( elem => elem.setAttribute("class", "projectLink notBlurred"))
  });
})

// Array.from(pj).forEach(function(element) {
//   element.addEventListener('mousemove', function(e){
//     console.log('oui')
//   });
// });


var uniforms
var scene, camera, fieldOfView, aspectRatio, height, width, nearPlane, farPlane, renderer, container

const init = function(){
  createScene()
  //createLights() // A ajouter
  createMesh()
  resizeScene() // A appeler dans create scene ?
  loop()
}

const loop = function(){
  render()
  interpolate()
  requestAnimationFrame(loop)
}

const render = function(){
  uniforms.u_time.value += 60/1000
  renderer.render( scene, camera )
}
console.log("bonjour")
const createScene = function(){
  scene = new THREE.Scene()

  aspectRatio = width / height
	fieldOfView = 60
	nearPlane = 1
	farPlane = 40000
  camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane)
	camera.rotation.order = 'YXZ' // default is 'XYZ'
	camera.position.x = 0 // gauche/droite
	camera.position.z = 1 // profondeur
	camera.position.y = 0 // hauteur

  renderer = new THREE.WebGLRenderer({ // voir tous les arguments existants
		alpha: true,
		antialias: true,
		shadowMap: THREE.PCFSoftShadowMap
	});
  height = window.innerHeight
	width = window.innerWidth
	renderer.setSize(width, height)
	renderer.shadowMap.enabled = true

  container = document.getElementById( 'myContainer' )
  container.appendChild(renderer.domElement)
  document.getElementsByTagName("canvas")[0].setAttribute("id", "myCanvas")
}
const createMesh = function(){
  var geometry = new THREE.PlaneBufferGeometry(2, 2, 4, 4)
  let seed = Math.random()*100
  uniforms = {
      u_time: {type: "f", value: 1.0},
      u_resolution: {type: "v2", value: new THREE.Vector2()},
      u_mouse: {type: "v2", value: new THREE.Vector2()},
      u_octave: {type: "f", value: 6.0},
      seed: {type: "f", value: seed},
  };

  var material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  } );

  var mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

var targetX = 0
var targetY = 0
document.onmousemove = function(e){
  targetX = e.x
  targetY = height - e.y
  let normalized = (15-2) * (e.x / width) + 2
  console.log(Math.floor(normalized))
  uniforms.u_octave.value = Math.floor(normalized)
}
const interpolate = function(){
  uniforms.u_mouse.value.x += (targetX-uniforms.u_mouse.value.x) * 0.02
  uniforms.u_mouse.value.y += (targetY-uniforms.u_mouse.value.y) * 0.02
}

const resizeScene = function(){
  console.log('oui')
	height = window.innerHeight
	width = window.innerWidth
	camera.aspect = width / height
	camera.updateProjectionMatrix()
	renderer.setSize(width, height)
  uniforms.u_resolution.value.x = renderer.domElement.width
  uniforms.u_resolution.value.y = renderer.domElement.height
}

window.addEventListener('load', init, false); // voir l'argument false ?
window.addEventListener('resize', resizeScene, false);
