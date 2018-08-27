// outils pour voir si référencé
// analytics

let pj = document.getElementsByClassName('container')
console.log(pj)

// Array.from(pj).forEach(function(element){
//   element.addEventListener('mouseover', function(e){
//     console.log('oui')
//   })
// })

// Array.from(pj).forEach(function(element) {
//   element.addEventListener('mousemove', function(e){
//     console.log('oui')
//   });
// });


var uniforms
var scene, camera, fieldOfView, aspectRatio, height, width, nearPlane, farPlane, renderer, container

init = function(){
  createScene()
  //createLights() // A ajouter
  createMesh()
  resizeScene() // A appeler dans create scene ?
  loop()
}

loop = function(){
  render()

  requestAnimationFrame(loop)
}

render = function(){
  uniforms.u_time.value += 60/1000
  renderer.render( scene, camera )
}

createScene = function(){
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
}

createMesh = function(){
  var geometry = new THREE.PlaneBufferGeometry(2, 2)

  uniforms = {
      u_time: { type: "f", value: 1.0 },
      u_resolution: { type: "v2", value: new THREE.Vector2() },
      u_mouse: { type: "v2", value: new THREE.Vector2() },
  };

  var material = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: document.getElementById( 'vertexShader' ).textContent,
      fragmentShader: document.getElementById( 'fragmentShader' ).textContent
  } );

  var mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)
}

document.onmousemove = function(e){
  uniforms.u_mouse.value.x = e.x
  uniforms.u_mouse.value.y = height - e.y
}


resizeScene = function(){
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
