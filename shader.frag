#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;  // Canvas size (width,height)
uniform vec2 u_mouse;       // mouse position in screen pixels
uniform float u_time;       // Time in seconds since load


// Ajouter un effet de molette amortissement quand on descend
void main() {
	gl_FragColor = vec4(sin(u_time*u_mouse.x), cos(u_time*u_mouse.x), sin(u_time*0.4*u_mouse.x), 1.0);
}
