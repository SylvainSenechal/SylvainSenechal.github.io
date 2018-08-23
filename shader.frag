#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load


// Ajouter un effet de molette amortissement quand on descend
void main() {
  vec2 mouse = u_mouse/u_resolution;
	gl_FragColor = vec4(sin(u_time)*mouse.x, cos(u_time)*mouse.x, sin(u_time)*mouse.y, 1.0);
}
