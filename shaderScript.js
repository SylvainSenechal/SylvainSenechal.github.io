console.log('oui')

uniform vec2 u_resolution;
uniform float u_time;

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    //gl_FragColor=vec4(st.x,st.y,0.0,1.0);
    int u = int(floor(400.0*0.1));
    //gl_FragColor=vec4(matrix[int(floor(400.0*st.x))], 0.0, 0.0, 1.0);
    gl_FragColor=vec4(sin(st.x*(u_time)), 0.0, 0.0, 1.0);

}
