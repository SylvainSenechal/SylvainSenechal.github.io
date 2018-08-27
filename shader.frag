// Ajouter un effet de molette amortissement quand on descend


#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

// Based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

#define OCTAVES 6
float fbm (in vec2 st) {
    // Initial values
    float value = 0.0;
    float amplitude = .5;
    float frequency = 0.;
    //
    // Loop of octaves
    mat2 rot = mat2(cos(0.5), sin(0.5),
                    -sin(0.5), cos(0.50));
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st);
        st = rot*st*2.;
        amplitude *= .5;
    }
    return value;
}

void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    //st.x *= u_resolution.x/u_resolution.y;
    float dst = distance(st, u_mouse/u_resolution.xy);

    vec3 color = vec3(0.0);
    vec2 q = vec2(1.0);
    vec2 r = vec2(1.0);
    q.x = fbm(st*3.0 + vec2(0.0, 0.0));
    q.y =  fbm(st*3.0 + vec2(5.2, 1.3));

	r.x = fbm(st*3.0 + q*3.0 + vec2(0.730,.210) + u_time*0.151);
    r.y = fbm(st*3.0 + q*3. + vec2(9.2, .8) - u_time*0.123);
    float f = fbm(st*3.0 + r*3.);

    color += fbm(st*3.0 + r*3.);
	color = mix(color, vec3(0.3, 0.1, 0.2), 0.5);

    gl_FragColor = vec4((f*f*f+0.6*f*f+0.5*f)*color, 1.0);
}
