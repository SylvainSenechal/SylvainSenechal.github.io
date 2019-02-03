THREE.fbmShader = {

	uniforms: {

		// "tDiffuse": { value: null },
		"u_time": {type: "f", value: 1.0},
		"u_resolution": {type: "v2", value: new THREE.Vector2()},
		"u_mouse": {type: "v2", value: new THREE.Vector2()},
		"u_octave": {type: "f", value: 6.0},
		"seed": {type: "f", value: 0}

	},

	vertexShader: [
		`void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }`
	].join( "\n" ),

	fragmentShader: [`

		#ifdef GL_ES
    precision highp float;
    #endif

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    uniform float u_octave;
    uniform float seed;

    float random (in vec2 st) {
        return fract(sin(dot(st.xy,
                             vec2(12.9898,78.233+seed)))*
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

    // #define OCTAVES 6
    float fbm (in vec2 st) {
        // Initial values
        float value = 0.0;
        float amplitude = .5;
        float frequency = 0.;
        //
        // Loop of octaves
        const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

        for (int i = 0; i < 100; i++) {
            if(i == int(u_octave)){
              break;
            }
            value += amplitude * noise(st);
            st = m*st*2.;
            // Commenter st pour un autre effet
            amplitude *= .5;
        }
        return value;
    }

    void main() {
        //vec2 st = gl_FragCoord.xy/u_resolution.y;
        vec2 st = (-u_resolution.xy+2.0*gl_FragCoord.xy)/u_resolution.y;
        //vec2 st = gl_FragCoord.xy/u_resolution.y*2.-1.;

        //st.x *= u_resolution.x/u_resolution.y;
        float dst = distance(st, (-u_resolution.xy+2.0*u_mouse)/u_resolution.y);

        vec3 color = vec3(0.0);
        vec2 q = vec2(1.0);
        vec2 r = vec2(1.0);
        vec2 m = vec2(1.0);
        vec2 n = vec2(1.0);
        q.x = fbm(st*3.0 + vec2(0.0, 0.0));
        q.y = fbm(st*3.0 + vec2(5.2, 1.3));

        r.x = fbm(st*3.0 + q*3.0 + vec2(0.730,.210));
        r.y = fbm(st*3.0 + q*3.0 + vec2(9.2, .8));

        m.x = fbm(st*3.0 + r*3.0 + vec2(0.1730,.210) - u_time*0.0018);
        m.y = fbm(st*3.0 + r*3.0 + vec2(0.30,.210) + u_time*0.02781);
        //
        // n.x = fbm(st*3.0 + m*3.0 + vec2(0.1730,.210) + u_time*0.0478);
        // n.y = fbm(st*3.0 + m*3.0 + vec2(0.30,.210) - u_time*0.0098);
        float f = fbm(st*3.0 + m*3.);

        color += fbm(st*3.0 + m*3.);
        //color = mix(color, vec3(0.783, 0.1, 0.5), 0.5);
        color = mix(color, vec3(.8, 0.1, 0.), clamp(1.-dst, -1., 1.));

        gl_FragColor = vec4((f*f*f+0.6*f*f+0.5*f)*color, 1.0);

    }`
	].join( "\n" )
}
