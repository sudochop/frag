precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iCamPos;
uniform mat4 iCamDir;
uniform sampler2D iSample;

const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 80.0;
const float EPSILON = 0.0001;

#pragma glslify: scene = require('./scene', iTime = iTime)
#pragma glslify: march = require('./march', scene = scene, steps = MAX_MARCHING_STEPS, epsilon = EPSILON)


vec3 rayDirection(float fov, vec2 size, vec2 coord) {
    vec2 xy = coord - size / 2.0;
    float z = size.y / tan(radians(fov) / 2.0);
    return normalize(vec3(xy, -z));
}

mat3 lookAt(vec3 origin, vec3 lookat, vec3 up) {
    // Based on gluLookAt man page
    vec3 f = normalize(lookat - origin);
    vec3 s = normalize(cross(f, up));
    vec3 u = cross(s, f);
    return mat3(s, u, -f);
}

vec3 estimateNormal(vec3 p) {
    return normalize(vec3(
        scene(vec3(p.x + EPSILON, p.y, p.z)).x - scene(vec3(p.x - EPSILON, p.y, p.z)).x,
        scene(vec3(p.x, p.y + EPSILON, p.z)).x - scene(vec3(p.x, p.y - EPSILON, p.z)).x,
        scene(vec3(p.x, p.y, p.z  + EPSILON)).x - scene(vec3(p.x, p.y, p.z - EPSILON)).x
    ));
}


void main() {
    // vec4 t = texture2D(iSample, gl_FragCoord.xy/iResolution);
    // gl_FragColor = t;
    // return;

    // vec2 uv = gl_FragCoord.xy - iResolution.xy*;

    vec3 rayDir = rayDirection(45., iResolution.xy, gl_FragCoord.xy);

    vec4 rd = iCamDir * vec4(rayDir, 0.);

    vec3 dist = march(iCamPos, rd.xyz, MIN_DIST, MAX_DIST);

    if (dist.y == -1.) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    vec3 p = iCamPos + dist.x * rd.xyz;

    if (dist.y == 0.) {
        p = estimateNormal(p);
        p = mix(p, vec3(1.), sqrt(dist.x/MAX_DIST));
        gl_FragColor = vec4(p, 1.);
        return;
    }

    gl_FragColor = vec4(1.);
   
}
